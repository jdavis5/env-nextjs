import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod3-max'
import { createEnv } from '@/src/core/create.js'

describe('createEnv', () => {
    const originalEnv = process.env

    beforeEach(() => {
        process.env = {}
    })

    afterAll(() => {
        process.env = originalEnv
    })

    describe('client context', () => {
        describe('runtime values', () => {
            it("uses process.env values referenced in 'clientRuntime'", () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(env.NEXT_PUBLIC_VALUE).toBe('hello')
            })

            it("uses literal values provided in 'clientRuntime'", () => {
                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE_A: z.string(),
                        NEXT_PUBLIC_VALUE_B: z.string().optional(),
                        NEXT_PUBLIC_VALUE_C: z.number(),
                        NEXT_PUBLIC_VALUE_D: z.boolean()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: 'hello',
                        NEXT_PUBLIC_VALUE_B: undefined,
                        NEXT_PUBLIC_VALUE_C: 123,
                        NEXT_PUBLIC_VALUE_D: true
                    }
                })

                expect(env).toEqual({
                    NEXT_PUBLIC_VALUE_A: 'hello',
                    NEXT_PUBLIC_VALUE_B: undefined,
                    NEXT_PUBLIC_VALUE_C: 123,
                    NEXT_PUBLIC_VALUE_D: true
                })
            })

            it("ignores unused keys defined in 'clientRuntime'", () => {
                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE_A: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: 'hello',
                        // @ts-expect-error: additional key included in 'clientRuntime'
                        NEXT_PUBLIC_VALUE_B: 'world'
                    }
                })

                expect(env).toEqual({
                    NEXT_PUBLIC_VALUE_A: 'hello'
                })
            })
        })

        describe('schema validation', () => {
            it('errors when a required process.env value is not set', () => {
                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'client',
                        schema: {
                            NEXT_PUBLIC_VALUE: z.string()
                        },
                        clientRuntime: {
                            NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it("errors when required 'schema' keys are missing in 'clientRuntime'", () => {
                process.env['NEXT_PUBLIC_VALUE_A'] = 'hello'

                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'client',
                        schema: {
                            NEXT_PUBLIC_VALUE_A: z.string(),
                            NEXT_PUBLIC_VALUE_B: z.string()
                        },
                        // @ts-expect-error: missing key in 'clientRuntime'
                        clientRuntime: {
                            NEXT_PUBLIC_VALUE_A: process.env['NEXT_PUBLIC_VALUE_A']
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('errors when environment variables do not validate', () => {
                process.env['NEXT_PUBLIC_VALUE'] = '99'

                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'client',
                        schema: {
                            NEXT_PUBLIC_VALUE: z.coerce.number().int().min(100)
                        },
                        clientRuntime: {
                            NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_INTEGER']
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('errors when an asynchronous function is used', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const errorspy = vi.spyOn(console, 'error').mockImplementation(() => {})

                expect(() => {
                    createEnv({
                        context: 'client',
                        schema: {
                            NEXT_PUBLIC_VALUE: z.string().refine(
                                async (_) => {
                                    await Promise.resolve()
                                    return false
                                },
                                { message: 'Unavailable' }
                            )
                        },
                        clientRuntime: {
                            NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                        }
                    })
                }).toThrow(/Environment validation failed/)

                expect(errorspy).toHaveBeenCalled()

                errorspy.mockRestore()
            })

            it('parses multiple schema entries', () => {
                process.env['NEXT_PUBLIC_VALUE_A'] = 'hello'
                process.env['NEXT_PUBLIC_VALUE_B'] = 'world'

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE_A: z.string(),
                        NEXT_PUBLIC_VALUE_B: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: process.env['NEXT_PUBLIC_VALUE_A'],
                        NEXT_PUBLIC_VALUE_B: process.env['NEXT_PUBLIC_VALUE_B']
                    }
                })

                expect(env).toEqual({
                    NEXT_PUBLIC_VALUE_A: 'hello',
                    NEXT_PUBLIC_VALUE_B: 'world'
                })
            })

            it('returns expected values', () => {
                process.env['NEXT_PUBLIC_VALUE_A'] = 'hello'
                process.env['NEXT_PUBLIC_VALUE_B'] = '123'
                process.env['NEXT_PUBLIC_VALUE_C'] = '456'
                process.env['NEXT_PUBLIC_VALUE_D'] = 'world'

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE_A: z.string(),
                        NEXT_PUBLIC_VALUE_B: z.coerce.number(),
                        NEXT_PUBLIC_VALUE_C: z.preprocess((value) => Number(value), z.number()),
                        NEXT_PUBLIC_VALUE_D: z.string().transform((value) => value.length > 1)
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: process.env['NEXT_PUBLIC_VALUE_A'],
                        NEXT_PUBLIC_VALUE_B: process.env['NEXT_PUBLIC_VALUE_B'],
                        NEXT_PUBLIC_VALUE_C: process.env['NEXT_PUBLIC_VALUE_C'],
                        NEXT_PUBLIC_VALUE_D: process.env['NEXT_PUBLIC_VALUE_D']
                    }
                })

                expect(env).toEqual({
                    NEXT_PUBLIC_VALUE_A: 'hello',
                    NEXT_PUBLIC_VALUE_B: 123,
                    NEXT_PUBLIC_VALUE_C: 456,
                    NEXT_PUBLIC_VALUE_D: true
                })
            })
        })

        describe('immutability', () => {
            it('errors when using direct assignment', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const originalValue = process.env['NEXT_PUBLIC_VALUE']

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(() => {
                    env.NEXT_PUBLIC_VALUE = 'world'
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.NEXT_PUBLIC_VALUE).toBe(originalValue)
            })

            it('errors when using Object.assign', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const originalValue = process.env['NEXT_PUBLIC_VALUE']

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(() => {
                    Object.assign(env, { NEXT_PUBLIC_VALUE: 'world' })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.NEXT_PUBLIC_VALUE).toBe(originalValue)
            })

            it('errors when using Object.defineProperty', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const originalValue = process.env['NEXT_PUBLIC_VALUE']

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(() => {
                    Object.defineProperty(env, 'NEXT_PUBLIC_VALUE', {
                        value: 'world',
                        writable: true
                    })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.NEXT_PUBLIC_VALUE).toBe(originalValue)
            })

            it('errors when using Object.defineProperties', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const originalValue = process.env['NEXT_PUBLIC_VALUE']

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(() => {
                    Object.defineProperties(env, {
                        NEXT_PUBLIC_VALUE: {
                            value: 'world',
                            writable: true
                        }
                    })
                }).toThrow(/Cannot set '[^']+', environment object is read-only/)

                expect(env.NEXT_PUBLIC_VALUE).toBe(originalValue)
            })

            it('errors when deleting properties', () => {
                process.env['NEXT_PUBLIC_VALUE'] = 'hello'

                const originalValue = process.env['NEXT_PUBLIC_VALUE']

                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE: z.string()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE: process.env['NEXT_PUBLIC_VALUE']
                    }
                })

                expect(() => {
                    // @ts-expect-error: deleting an environment object property
                    delete env.NEXT_PUBLIC_VALUE
                }).toThrow(/Cannot delete '[^']+', environment object is read-only/)

                expect(env.NEXT_PUBLIC_VALUE).toBe(originalValue)
            })
        })
    })
})
