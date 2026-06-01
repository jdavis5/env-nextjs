import { describe, expect, it } from 'vitest'
import { formatPath, prependPath } from '@/src/core/path.js'
import type { ZCIssue } from '@/src/core/types/zod-compat.js'

describe('formatPath', () => {
    const testCases = [
        [
            'formats an empty path as an empty string',
            {
                path: [],
                expected: ''
            }
        ],
        [
            'formats ["a"] as "a"',
            {
                path: ['a'],
                expected: 'a'
            }
        ],
        [
            'formats ["a", 0] as "a[0]"',
            {
                path: ['a', 0],
                expected: 'a[0]'
            }
        ],
        [
            'formats ["a", 1] as "a[1]"',
            {
                path: ['a', 1],
                expected: 'a[1]'
            }
        ],
        [
            'formats ["a", "b"] as "a.b"',
            {
                path: ['a', 'b'],
                expected: 'a.b'
            }
        ],
        [
            'formats ["a", "b", 0] as "a.b[0]"',
            {
                path: ['a', 'b', 0],
                expected: 'a.b[0]'
            }
        ],
        [
            'formats ["a", "b", 1] as "a.b[1]"',
            {
                path: ['a', 'b', 1],
                expected: 'a.b[1]'
            }
        ],
        [
            'formats ["a", "b", "c"] as a.b.c',
            {
                path: ['a', 'b', 'c'],
                expected: 'a.b.c'
            }
        ],
        [
            'formats ["a", 0, "b", 1] as a[0].b[1]',
            {
                path: ['a', 0, 'b', 1],
                expected: 'a[0].b[1]'
            }
        ]
    ] satisfies Array<
        [
            string,
            {
                path: ZCIssue['path']
                expected: string
            }
        ]
    >

    it.each(testCases)('%s', (_, { path, expected }) => {
        expect(formatPath(path)).toBe(expected)
    })
})

describe('prependPath', () => {
    const testCases = [
        [
            'prepends "a" to []',
            {
                segment: 'a',
                issue: { message: '', path: [] },
                expected: { message: '', path: ['a'] }
            }
        ],
        [
            'prepends "b" to ["a"]',
            {
                segment: 'b',
                issue: { message: '', path: ['a'] },
                expected: { message: '', path: ['b', 'a'] }
            }
        ],
        [
            'prepends 0 to []',
            {
                segment: 0,
                issue: { message: '', path: [] },
                expected: { message: '', path: [0] }
            }
        ],
        [
            'prepends 1 to [0]',
            {
                segment: 1,
                issue: { message: '', path: [0] },
                expected: { message: '', path: [1, 0] }
            }
        ],
        [
            'prepends 0 to ["a"]',
            {
                segment: 0,
                issue: { message: '', path: ['a'] },
                expected: { message: '', path: [0, 'a'] }
            }
        ],
        [
            'prepends 1 to ["a", 0]',
            {
                segment: 1,
                issue: { message: '', path: ['a', 0] },
                expected: { message: '', path: [1, 'a', 0] }
            }
        ],
        [
            'prepends "b" to [0, "a"]',
            {
                segment: 'b',
                issue: { message: '', path: [0, 'a'] },
                expected: { message: '', path: ['b', 0, 'a'] }
            }
        ]
    ] satisfies Array<
        [
            string,
            {
                segment: string | number
                issue: ZCIssue
                expected: ZCIssue
            }
        ]
    >

    it.each(testCases)('%s', (_, { segment, issue, expected }) => {
        expect(prependPath(segment, issue)).toEqual(expected)
    })
})
