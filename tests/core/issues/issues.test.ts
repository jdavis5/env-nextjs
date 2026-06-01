import { describe, expect, it } from 'vitest'
import { prettifyIssues } from '@/src/core/issues.js'
import type { ZCIssue } from '@/src/core/types/zod-compat.js'
import { normalizePrettifiedIssues } from './issues.helpers'

describe('prettifyIssues', () => {
    const messages = {
        INVALID: 'Invalid input',
        CUSTOM: 'Custom message',
        UNEXPECTED_KEY: 'Unexpected key'
    } as const

    it('is an empty string when no issues are provided', () => {
        const output = prettifyIssues({ issues: [] })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([])
    })

    it('includes a heading when provided', () => {
        const issues = [{ message: messages.CUSTOM, path: [] }] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues, heading: 'Heading' })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([
            { text: 'Heading', indent: 0 },
            { text: messages.CUSTOM, indent: 0 }
        ])
    })

    it('does not add a heading when not provided', () => {
        const issues = [{ message: messages.INVALID, path: [] }] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([{ text: messages.INVALID, indent: 0 }])
    })

    it('does not add a heading when no issues are provided', () => {
        const output = prettifyIssues({ issues: [], heading: 'Heading' })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([])
    })

    it('formats multiple top-level issues correctly', () => {
        const issues = [
            { message: messages.CUSTOM, path: [] },
            { message: messages.UNEXPECTED_KEY, path: [] },
            { message: messages.UNEXPECTED_KEY, path: [] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([
            { text: messages.CUSTOM, indent: 0 },
            { text: messages.UNEXPECTED_KEY, indent: 0 },
            { text: messages.UNEXPECTED_KEY, indent: 0 }
        ])
    })

    it('formats multiple pathed issues correctly', () => {
        const issues = [
            { message: messages.INVALID, path: [0] },
            { message: messages.INVALID, path: [1, 1] },
            { message: messages.INVALID, path: [1, 'a'] },
            { message: messages.INVALID, path: ['a'] },
            { message: messages.INVALID, path: ['a', 'b'] },
            { message: messages.INVALID, path: ['a', 'b', 0] },
            { message: messages.INVALID, path: ['a', 'b', 0, 'c'] },
            { message: messages.INVALID, path: ['a', 'b', 0, 'c', 1] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([
            { text: messages.INVALID, indent: 0 },
            { text: 'at [0]', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at [1][1]', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at [1].a', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a.b', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a.b[0]', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a.b[0].c', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a.b[0].c[1]', indent: 2 }
        ])
    })

    it('formats top-level and pathed issues correctly', () => {
        const issues = [
            { message: messages.CUSTOM, path: [] },
            { message: messages.UNEXPECTED_KEY, path: [] },
            { message: messages.INVALID, path: [0] },
            { message: messages.INVALID, path: [1, 'a', 'b'] },
            { message: messages.UNEXPECTED_KEY, path: ['a', 'b', 'c'] },
            { message: messages.INVALID, path: ['b', 3] },
            { message: messages.INVALID, path: ['b', 4] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'normal' })

        expect(normalizedOutput).toEqual([
            { text: messages.CUSTOM, indent: 0 },
            { text: messages.UNEXPECTED_KEY, indent: 0 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at [0]', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at [1].a.b', indent: 2 },
            { text: messages.UNEXPECTED_KEY, indent: 0 },
            { text: 'at a.b.c', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at b[3]', indent: 2 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at b[4]', indent: 2 }
        ])
    })

    it('applies a top-level indent when provided', () => {
        const issues = [
            { message: messages.CUSTOM, path: [] },
            { message: messages.INVALID, path: ['a', 'b'] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues, topIndent: 4 })
        const normalizedOutput = normalizePrettifiedIssues(output, {
            mode: 'normal'
        })

        expect(normalizedOutput).toEqual([
            { text: messages.CUSTOM, indent: 4 },
            { text: messages.INVALID, indent: 4 },
            { text: 'at a.b', indent: 6 }
        ])
    })

    it('applies nested indents when provided', () => {
        const issues = [
            { message: messages.CUSTOM, path: [] },
            { message: messages.INVALID, path: ['a', 'b'] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues, nestedIndent: 4 })
        const normalizedOutput = normalizePrettifiedIssues(output, {
            mode: 'normal'
        })

        expect(normalizedOutput).toEqual([
            { text: messages.CUSTOM, indent: 0 },
            { text: messages.INVALID, indent: 0 },
            { text: 'at a.b', indent: 4 }
        ])
    })

    it('renders output with correct icons and whitespace', () => {
        const issues = [
            { message: messages.CUSTOM, path: [] },
            { message: messages.UNEXPECTED_KEY, path: [] },
            { message: messages.INVALID, path: ['a', 'b'] },
            { message: messages.INVALID, path: ['a', 'c'] }
        ] satisfies Array<ZCIssue>

        const output = prettifyIssues({ issues, heading: 'Heading', topIndent: 2, nestedIndent: 2 })
        const normalizedOutput = normalizePrettifiedIssues(output, { mode: 'preserve' })

        expect(normalizedOutput).toEqual([
            { text: 'Heading', indent: 0 },
            { text: '', indent: 0 },
            { text: `✖ ${messages.CUSTOM}`, indent: 2 },
            { text: '', indent: 0 },
            { text: `✖ ${messages.UNEXPECTED_KEY}`, indent: 2 },
            { text: '', indent: 0 },
            { text: `✖ ${messages.INVALID}`, indent: 2 },
            { text: '→ at a.b', indent: 4 },
            { text: '', indent: 0 },
            { text: `✖ ${messages.INVALID}`, indent: 2 },
            { text: '→ at a.c', indent: 4 },
            { text: '', indent: 0 }
        ])
    })
})
