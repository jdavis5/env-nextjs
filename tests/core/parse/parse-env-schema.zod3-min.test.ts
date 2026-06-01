import { describe, expect, it } from 'vitest'
import { z } from 'zod3-min'
import { parseEnvSchema } from '@/src/core/parse.js'

describe('parseEnvSchema', () => {
    describe('schema parsing', () => {
        describe('success', () => {
            it('succeeds when all entries validate', () => {
                const result = parseEnvSchema(
                    { a: z.string(), b: z.string(), c: z.number() },
                    { a: 'hello', b: 'world', c: 123 }
                )

                expect(result.success).toBe(true)
            })

            it('returns a successful parse object', () => {
                const result = parseEnvSchema(
                    { a: z.string(), b: z.string(), c: z.number(), d: z.boolean() },
                    { a: 'hello', b: 'world', c: 123, d: true }
                )

                expect(result).toEqual({
                    success: true,
                    data: { a: 'hello', b: 'world', c: 123, d: true }
                })
            })
        })

        describe('failure', () => {
            it('fails when at least one entry does not validate', () => {
                const result = parseEnvSchema(
                    { a: z.string(), b: z.string(), c: z.string() },
                    { a: 'hello', b: 'world', c: 123 }
                )

                expect(result.success).toBe(false)
            })

            it('returns a failed parse object', () => {
                const result = parseEnvSchema({ a: z.string(), b: z.string() }, {})

                expect(result.success).toBe(false)

                if (result.success) {
                    throw new Error("Expected 'success' to be false")
                }

                result.issues.forEach((issue) => {
                    expect(issue).toMatchObject({
                        path: expect.any(Array),
                        message: expect.any(String)
                    })
                })
            })

            it('prepends schema keys to issue paths', () => {
                const result = parseEnvSchema(
                    {
                        a: z.string(),
                        b: z.array(z.number()),
                        c: z.object({ x: z.number(), y: z.number() })
                    },
                    { a: 123, b: ['hello'], c: { x: 'hello', y: 123 } }
                )

                expect(result).toMatchObject({
                    issues: expect.arrayContaining([
                        expect.objectContaining({ path: ['a'] }),
                        expect.objectContaining({ path: ['b', 0] }),
                        expect.objectContaining({ path: ['c', 'x'] })
                    ])
                })
            })

            it('preserves issue order', () => {
                const result = parseEnvSchema(
                    {
                        a: z.string(),
                        b: z.number().min(100),
                        c: z.boolean(),
                        d: z.literal('hello')
                    },
                    { b: 99, c: false, d: 'world' }
                )

                expect(result).toMatchObject({
                    issues: [
                        { path: ['a'], message: expect.any(String) },
                        { path: ['b'], message: expect.any(String) },
                        { path: ['d'], message: expect.any(String) }
                    ]
                })
            })

            it('adds an issue when an asynchronous function is used', () => {
                const result = parseEnvSchema(
                    {
                        a: z.string().refine(
                            async (_) => {
                                await Promise.resolve()
                                return false
                            },
                            { message: 'Unavailable' }
                        )
                    },
                    { a: 'hello' }
                )

                expect(result).toMatchObject({
                    issues: [{ path: ['a'], message: 'Asynchronous validation is unsupported' }]
                })
            })
        })
    })
})
