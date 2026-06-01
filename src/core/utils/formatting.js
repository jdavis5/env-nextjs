/**
 * Indents a string by prefixing it with spaces.
 *
 * @param {string} text - The text to indent.
 * @param {number} [padding=2] - Number of spaces to prefix.
 * @returns {string} The indented text.
 */
export function indent(text, padding = 2) {
    if (!Number.isInteger(padding) || padding < 0) {
        throw new RangeError('Padding must be a non-negative integer');
    }
    return `${' '.repeat(padding)}${text}`;
}
