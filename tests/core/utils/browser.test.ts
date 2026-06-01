import { afterEach, describe, expect, it } from 'vitest'
import { isBrowser } from '@/src/core/utils/browser.js'

describe('isBrowser', () => {
    const originalWindow = globalThis.window

    afterEach(() => {
        globalThis.window = originalWindow
    })

    it("returns false when 'window' does not exist", () => {
        // @ts-expect-error: deleting 'window' to test output if undefined
        delete globalThis.window

        expect(isBrowser()).toBe(false)
    })

    it("returns true when 'window' exists", () => {
        // @ts-expect-error: mocking a minimal 'window' to test output if defined
        globalThis.window = {}

        expect(isBrowser()).toBe(true)
    })
})
