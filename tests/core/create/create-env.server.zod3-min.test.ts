import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod3-min'
import { createEnv } from '@/src/core/create.js'
import * as browser from '@/src/core/utils/browser.js'

describe('createEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
        process.env = {}
    })

    afterAll(() => {
        process.env = originalEnv
    })

    describe('server context', () => {
        describe('schema validation', () => {
            it('errors when a required process.env value is not set', () => {
                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'server',
                        schema: {
                            VALUE: z.string()
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('errors when environment variables do not validate', () => {
                process.env['VALUE'] = '99'

                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'server',
                        schema: {
                            VALUE: z
                                .string()
                                .transform(Number)
                                .refine((value) => Number.isInteger(value) && value >= 100)
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('errors when an asynchronous functions is used', () => {
                process.env['VALUE'] = 'hello'

                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'server',
                        schema: {
                            VALUE: z.string().refine(
                                async (_) => {
                                    await Promise.resolve()
                                    return false
                                },
                                { message: 'Unavailable' }
                            )
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('parses multiple schema entries', () => {
                process.env['VALUE_A'] = 'hello'
                process.env['VALUE_B'] = 'world'

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE_A: z.string(),
                        VALUE_B: z.string()
                    }
                })

                expect(env).toEqual({
                    VALUE_A: 'hello',
                    VALUE_B: 'world'
                })
            })

            it('returns expected values', () => {
                process.env['VALUE_A'] = 'hello'
                process.env['VALUE_B'] = '123'
                process.env['VALUE_C'] = 'world'

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE_A: z.string(),
                        VALUE_B: z.string().transform(Number),
                        VALUE_C: z.string().transform((value) => value.length > 1)
                    }
                })

                expect(env).toEqual({
                    VALUE_A: 'hello',
                    VALUE_B: 123,
                    VALUE_C: true
                })
            })
        })

        describe('immutability', () => {
            it('errors when using direct assignment', () => {
                process.env['VALUE'] = 'hello'

                const originalValue = process.env['VALUE']

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z.string()
                    }
                })

                expect(() => {
                    env.VALUE = 'world'
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.VALUE).toBe(originalValue)
            })

            it('errors when using Object.assign', () => {
                process.env['VALUE'] = 'hello'

                const originalValue = process.env['VALUE']

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z.string()
                    }
                })

                expect(() => {
                    Object.assign(env, { VALUE: 'world' })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.VALUE).toBe(originalValue)
            })

            it('errors when using Object.defineProperty', () => {
                process.env['VALUE'] = 'hello'

                const originalValue = process.env['VALUE']

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z.string()
                    }
                })

                expect(() => {
                    Object.defineProperty(env, 'VALUE', {
                        value: 'world',
                        writable: true
                    })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.VALUE).toBe(originalValue)
            })

            it('errors when using Object.defineProperties', () => {
                process.env['VALUE'] = 'hello'

                const originalValue = process.env['VALUE']

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z.string()
                    }
                })

                expect(() => {
                    Object.defineProperties(env, {
                        VALUE: {
                            value: 'world',
                            writable: true
                        }
                    })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.VALUE).toBe(originalValue)
            })

            it('errors when deleting properties', () => {
                process.env['VALUE'] = 'hello'

                const originalValue = process.env['VALUE']

                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z.string()
                    }
                })

                expect(() => {
                    // @ts-expect-error: deleting an environment object property
                    delete env.VALUE
                }).toThrow(/Cannot delete '[^']+', environment object is read-only/)

                expect(env.VALUE).toBe(originalValue)
            })
        })
    })

    describe('runtime constraints', () => {
        it('errors when a server environment object is used in the browser', () => {
            process.env['VALUE'] = '3000'

            const browserSpy = vi.spyOn(browser, 'isBrowser').mockReturnValue(true)

            expect(() => {
                createEnv({
                    context: 'server',
                    schema: {
                        VALUE: z
                            .string()
                            .transform(Number)
                            .refine(
                                (value) => Number.isInteger(value) && value >= 1 && value <= 65535
                            )
                    }
                })
            }).toThrow(/'server' context cannot be used in this environment/)

            browserSpy.mockRestore()
        })
    })
})
