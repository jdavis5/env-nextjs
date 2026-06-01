import type { Configuration } from 'lint-staged'

const lintStagedConfig: Configuration = {
    '*.{js,ts,json,jsonc}': ['pnpm biome check --fix'],
    '*.{md,yaml,yml}': ['pnpm prettier --write']
}

export default lintStagedConfig
