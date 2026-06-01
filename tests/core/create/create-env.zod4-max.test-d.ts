import { describe, expectTypeOf, it } from 'vitest'
import { z } from 'zod4-max'
import { createEnv } from '@/src/core/create.js'

describe('createEnv', () => {
    describe('server context', () => {
        describe('type inference', () => {
            it('infers output types from schemas', () => {
                const env = createEnv({
                    context: 'server',
                    schema: {
                        VALUE_A: z.string(),
                        VALUE_B: z.string().transform((value) => value.length > 1),
                        VALUE_C: z.preprocess((value) => Number(value), z.number()),
                        VALUE_D: z.coerce.number()
                    }
                })

                expectTypeOf(env).toEqualTypeOf<{
                    VALUE_A: string
                    VALUE_B: boolean
                    VALUE_C: number
                    VALUE_D: number
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
                        NEXT_PUBLIC_VALUE_B: z.string().transform((value) => value.length > 1),
                        NEXT_PUBLIC_VALUE_C: z.preprocess((value) => Number(value), z.number()),
                        NEXT_PUBLIC_VALUE_D: z.coerce.number()
                    },
                    clientRuntime: {
                        NEXT_PUBLIC_VALUE_A: 'hello',
                        NEXT_PUBLIC_VALUE_B: 'world',
                        NEXT_PUBLIC_VALUE_C: '123',
                        NEXT_PUBLIC_VALUE_D: '456'
                    }
                })

                expectTypeOf(env).toEqualTypeOf<{
                    NEXT_PUBLIC_VALUE_A: string
                    NEXT_PUBLIC_VALUE_B: boolean
                    NEXT_PUBLIC_VALUE_C: number
                    NEXT_PUBLIC_VALUE_D: number
                }>
            })
        })
    })
})
