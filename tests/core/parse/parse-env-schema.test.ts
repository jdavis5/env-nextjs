import { describe, expect, it } from 'vitest'
import { parseEnvSchema } from '@/src/core/parse.js'

describe('parseEnvSchema', () => {
    describe('input validation', () => {
        describe('invalid schema', () => {
            it.each([
                ['undefined', undefined],
                ['null', null],
                ['an empty array', []],
                ['a string', 'hello'],
                ['a number', 123]
            ] satisfies Array<[string, unknown]>)("errors when using %s'", (_, schema) => {
                expect(() => {
                    // @ts-expect-error: invalid schema
                    parseEnvSchema(schema, {})
                }).toThrow(/Must be a non-null object/)
            })
        })

        describe('invalid value', () => {
            it.each([
                ['undefined', undefined],
                ['null', null],
                ['an empty array', []],
                ['a string', 'hello'],
                ['a number', 123]
            ] satisfies Array<[string, unknown]>)("errors when using %s'", (_, value) => {
                expect(() => {
                    // @ts-expect-error: invalid value
                    parseEnvSchema({}, value)
                }).toThrow(/Must be a non-null object/)
            })
        })
    })
})
