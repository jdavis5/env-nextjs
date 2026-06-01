import { describe, expect, it } from 'vitest'
import { indent } from '@/src/core/utils/formatting.js'

describe('indent', () => {
    describe('valid padding', () => {
        const testCases = [
            [
                'prepends 0 spaces to a non-empty string',
                {
                    text: 'example',
                    padding: 0,
                    expected: 'example'
                }
            ],
            [
                'prepends 4 spaces to a non-empty string',
                {
                    text: 'example',
                    padding: 4,
                    expected: '    example'
                }
            ],
            [
                'prepends 0 spaces to single space',
                {
                    text: ' ',
                    padding: 0,
                    expected: ' '
                }
            ],
            [
                'prepends 4 spaces to a single space',
                {
                    text: ' ',
                    padding: 4,
                    expected: '     '
                }
            ],
            [
                'prepends 0 spaces to a tab character',
                {
                    text: '\t',
                    padding: 0,
                    expected: '\t'
                }
            ],
            [
                'prepends 4 spaces to a tab character',
                {
                    text: '\t',
                    padding: 4,
                    expected: '    \t'
                }
            ],
            [
                'prepends 0 spaces to a newline character',
                {
                    text: '\n',
                    padding: 0,
                    expected: '\n'
                }
            ],
            [
                'prepends 4 spaces to a newline character',
                {
                    text: '\n',
                    padding: 4,
                    expected: '    \n'
                }
            ],
            [
                'prepends 0 spaces to an empty string',
                {
                    text: '',
                    padding: 0,
                    expected: ''
                }
            ],
            [
                'prepends 4 spaces to an empty string',
                {
                    text: '',
                    padding: 4,
                    expected: '    '
                }
            ]
        ] satisfies Array<
            [
                string,
                {
                    text: string
                    padding: number
                    expected: string
                }
            ]
        >

        it.each(testCases)('%s', (_, { text, padding, expected }) => {
            expect(indent(text, padding)).toBe(expected)
        })
    })

    describe('invalid padding', () => {
        const testCases = [
            [
                'padding is a negative integer',
                {
                    text: 'example',
                    padding: -5
                }
            ],
            [
                'padding is a positive decimal',
                {
                    text: 'example',
                    padding: 1.234
                }
            ],
            [
                'padding is a negative decimal',
                {
                    text: 'example',
                    padding: -1.234
                }
            ],
            [
                'padding is NaN',
                {
                    text: 'example',
                    padding: NaN
                }
            ],
            [
                'padding is Infinity',
                {
                    text: 'example',
                    padding: Infinity
                }
            ],
            [
                'padding is -Infinity',
                {
                    text: 'example',
                    padding: -Infinity
                }
            ]
        ] satisfies Array<
            [
                string,
                {
                    text: string
                    padding: number
                }
            ]
        >

        it.each(testCases)('throws a RangeError when %s', (_, { text, padding }) => {
            expect(() => indent(text, padding)).toThrow(
                new RangeError('Padding must be a non-negative integer')
            )
        })
    })
})
