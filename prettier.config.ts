import type { Config } from 'prettier'

const prettierConfig: Config = {
    printWidth: 80,
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    trailingComma: 'none',
    overrides: [
        {
            files: '*.md',
            options: {
                proseWrap: 'never',
                tabWidth: 2
            }
        },
        {
            files: ['*.yaml', '*.yml'],
            options: {
                tabWidth: 2
            }
        }
    ]
}

export default prettierConfig
