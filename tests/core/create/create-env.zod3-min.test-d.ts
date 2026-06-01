import { describe, expectTypeOf, it } from 'vitest'
import { z } from 'zod3-min'
import { createEnv } from '@/src/core/create.js'

describe('createEnv', () => {
    describe('server context', () => {
        describe('type inference', () => {
            it('infers output types from schemas', () => {
                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE_A: z.string(),
                        VALUE_B: z.string().transform(Number),
                        VALUE_C: z.string().transform((value) => value.length > 1)
                    }
                })

                expectTypeOf(env).toEqualTypeOf<{
                    VALUE_A: string
                    VALUE_B: number
                    VALUE_C: boolean
                }>
            })
        })
    })

    describe('client context', () => {
        describe('configuration validation', () => {
            it("errors if 'schema' keys are not prefixed with 'NEXT_PUBLIC_'", () => {
                // @ts-expect-error: intentionally omitting the 'NEXT_PUBLIC_' prefix to cause a type error
                createEnv({
                    context: 'client',
                    schema: {
                        VALUE: z.string()
                    },
                    clientRuntime: {
                        VALUE: 'hello'
                    }
                })
            })

            it("errors if 'schema' keys are missing from 'clientRuntime'", () => {
                createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_A: z.string(),
                        NEXT_PUBLIC_B: z.string()
                    },
                    // @ts-expect-error: omitting 'NEXT_PUBLIC_B' from 'clientRuntime' to cause a type error
                    clientRuntime: {
                        NEXT_PUBLIC_A: 'hello'
                    }
                })
            })
        })

        describe('type inference', () => {
            it('infers output types from schemas', () => {
                const env = createEnv({
                    context: 'client',
                    schema: {
                        NEXT_PUBLIC_VALUE_A: z.string(),
                        NEXT_PUBLIC_VALUE_B: z.string().transform(Number),
                        NEXT_PUBLIC_VALUE_C: z.string().transform((value) => value.length > 1)
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: 'hello',
                        NEXT_PUBLIC_VALUE_B: '123',
                        NEXT_PUBLIC_VALUE_C: 'world'
                    }
                })

                expectTypeOf(env).toEqualTypeOf<{
                    NEXT_PUBLIC_VALUE_A: string
                    NEXT_PUBLIC_VALUE_B: number
                    NEXT_PUBLIC_VALUE_C: boolean
                }>
            })
        })
    })
})
