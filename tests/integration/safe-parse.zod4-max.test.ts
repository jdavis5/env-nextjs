import { describe, expect, it } from 'vitest'
import { z } from 'zod4-max'

describe('safeParse', () => {
    it('returns a successful parse object', () => {
        const result = z.string().safeParse('hello')

        expect(result).toEqual({
            success: true,
            data: 'hello'
        })
    })

    it('returns a failed parse object', () => {
        const result = z.object({ a: z.string(), b: z.string() }).safeParse(undefined)

        expect(result.success).toBe(false)

        if (result.success) {
            throw new Error("Expected 'success' to be false")
        }

        result.error.issues.forEach((issue) => {
            expect(issue).toMatchObject({
                message: expect.any(String),
                path: expect.any(Array)
            })
        })
    })
})

describe('safeParseAsync', () => {
    it('returns a successful parse object', async () => {
        const result = await z.string().safeParseAsync('hello')

        expect(result).toEqual({
            success: true,
            data: 'hello'
        })
    })

    it('returns failed parse object', async () => {
        const result = await z.object({ a: z.string(), b: z.string() }).safeParseAsync(undefined)

        expect(result.success).toBe(false)

        if (result.success) {
            throw new Error("Expected 'success' to be false")
        }

        result.error.issues.forEach((issue) => {
            expect(issue).toMatchObject({
                message: expect.any(String),
                path: expect.any(Array)
            })
        })
    })
})
