import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        tsconfigPaths: true
    },
    test: {
        silent: 'passed-only',
        typecheck: {
            tsconfig: 'tests/tsconfig.json'
        }
    }
})
