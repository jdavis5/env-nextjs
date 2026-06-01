/**
 * Represents a normalised line of prettified output.
 */
type NormalizedLine = {
    /** Line content trimmed of its leading and trailing whitespace. */
    text: string
    /** The number of leading spaces before trimming. */
    indent: number
}

/**
 * Normalises a line of prettified output into a structured form.
 *
 * Counts the leading spaces as indentation and trims the line content.
 */
const normalizeLine = (value: string): NormalizedLine => {
    const indentMatch = value.match(/^ */)
    const indent = indentMatch ? indentMatch[0].length : 0
    const text = value.trim()
    return { text, indent }
}

/**
 * Normalises the output of `prettifyIssues` for testing.
 *
 * Returns an array of normalised lines from prettified output, using the following modes:
 * - `normal` removes empty lines and icons.
 * - `preserve` preserves empty lines and icons.
 */
export function normalizePrettifiedIssues(
    content: string,
    options: {
        mode: 'normal' | 'preserve'
    }
) {
    return content
        .split('\n')
        .filter((value) => {
            if (options.mode === 'preserve') {
                return true
            }
            return Boolean(value)
        })
        .map((value) => {
            if (options.mode === 'preserve') {
                return value
            }
            return value.replace(/([✖→]\s*)+/g, '')
        })
        .map(normalizeLine)
}
