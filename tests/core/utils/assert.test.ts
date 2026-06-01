import { describe, expect, it } from 'vitest'
import { assertObject } from '@/src/core/utils/assert.js'

describe('assertObject', () => {
    describe('valid objects', () => {
        it('allows valid objects', () => {
            expect(() => {
                assertObject({}, 'Unexpected error message')
            }).not.toThrow(/Unexpected error message/)
        })
    })

    describe('invalid objects', () => {
        it.each([
            ['undefined', undefined],
            ['null', null],
            ['an empty array', []],
            ['a string', 'hello'],
            ['a number', 123],
            ['a function', () => {}]
        ] satisfies Array<[string, unknown]>)('errors when using %s', (_, value) => {
            expect(() => {
                assertObject(value, 'Error message')
            }).toThrow(/Error message/)
        })
    })
})
