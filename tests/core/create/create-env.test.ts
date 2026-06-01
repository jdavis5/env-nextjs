import { describe, expect, it, vi } from 'vitest'
import { createEnv } from '@/src/core/create.js'

describe('createEnv', () => {
    describe('configuration', () => {
        it('errors when no arguments are provided', () => {
            expect(() => {
                // @ts-expect-error: options not provided
                createEnv()
            }).toThrow(/Environment configuration must be a non-null object/)
        })

        it.each([
            ['undefined', undefined],
            ['null', null],
            ['an empty array', []],
            ['a string', 'hello'],
            ['a number', 123]
        ] satisfies Array<[string, unknown]>)('errors when using %s', (_, options) => {
            expect(() => {
                // @ts-expect-error: invalid options used
                createEnv(options)
            }).toThrow(/Environment configuration must be a non-null object/)
        })

        describe("'context' property", () => {
            it.each([
                ['property is missing', {}],
                ["property is missing with 'schema' defined", { schema: {} }]
            ] satisfies Array<[string, unknown]>)('errors when %s', (_, options) => {
                expect(() => {
                    // @ts-expect-error: 'context' not provided
                    createEnv(options)
                }).toThrow(/'context' must be 'server' or 'client'/)
            })

            it.each([
                ['undefined', undefined],
                ['null', null],
                ['an empty object', {}],
                ['an empty array', []],
                ['a string', 'unsupported'],
                ['a number', 123]
            ] satisfies Array<[string, unknown]>)('errors when using %s', (_, context) => {
                expect(() => {
                    createEnv({
                        // @ts-expect-error: invalid 'context' used
                        context,
                        schema: {}
                    })
                }).toThrow(/'context' must be 'server' or 'client'/)
            })
        })
    })

    describe('server context', () => {
        describe('configuration', () => {
            describe("'schema' property", () => {
                it('errors when property is missing', () => {
                    expect(() => {
                        // @ts-expect-error: 'schema' not provided
                        createEnv({
                            context: 'server'
                        })
                    }).toThrow(/'schema' must be a non-null object/)
                })

                it.each([
                    ['undefined', undefined],
                    ['null', null],
                    ['an empty array', []],
                    ['a string', 'hello'],
                    ['a number', 123]
                ] satisfies Array<[string, unknown]>)('errors when using %s', (_, schema) => {
                    expect(() => {
                        createEnv({
                            context: 'server',
                            // @ts-expect-error: invalid 'schema' used
                            schema
                        })
                    }).toThrow(/'schema' must be a non-null object/)
                })

                it('warns when using an empty object', () => {
                    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

                    createEnv({
                        context: 'server',
                        schema: {}
                    })

                    expect(warnSpy).toHaveBeenCalledWith(
                        expect.stringContaining("'schema' for 'server' is empty")
                    )

                    warnSpy.mockRestore()
                })
            })
        })
    })

    describe('client context', () => {
        describe('configuration', () => {
            describe("'schema' property", () => {
                it('errors when property is missing', () => {
                    expect(() => {
                        // @ts-expect-error: 'schema' not provided
                        createEnv({
                            context: 'client'
                        })
                    }).toThrow(/'schema' must be a non-null object/)
                })

                it.each([
                    ['undefined', undefined],
                    ['null', null],
                    ['an empty array', []],
                    ['a string', 'hello'],
                    ['a number', 123]
                ] satisfies Array<[string, unknown]>)('errors when using %s ', (_, schema) => {
                    expect(() => {
                        createEnv({
                            context: 'client',
                            // @ts-expect-error: invalid 'schema' used
                            schema
                        })
                    }).toThrow(/'schema' must be a non-null object/)
                })

                it('warns when using an empty object', () => {
                    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

                    createEnv({
                        context: 'client',
                        schema: {},
                        clientRuntime: {}
                    })

                    expect(warnSpy).toHaveBeenCalledWith(
                        expect.stringContaining("'schema' for 'client' is empty")
                    )

                    warnSpy.mockRestore()
                })
            })

            describe("'clientRuntime' property", () => {
                it('defaults to an empty object when property is missing', () => {
                    expect(() => {
                        // @ts-expect-error: 'clientRuntime' not provided
                        createEnv({
                            context: 'client',
                            schema: {}
                        })
                    }).not.toThrow(/Environment validation failed/)
                })

                it.each([
                    ['undefined', undefined],
                    ['null', null],
                    ['an empty array', []],
                    ['a string', 'hello'],
                    ['a number', 123]
                ] satisfies Array<
                    [string, unknown]
                >)('errors when using %s ', (_, clientRuntime) => {
                    expect(() => {
                        createEnv({
                            context: 'client',
                            schema: {},
                            // @ts-expect-error: invalid 'clientRuntime' used
                            clientRuntime
                        })
                    }).toThrow(/'clientRuntime' must be a non-null object/)
                })
            })
        })
    })
})
