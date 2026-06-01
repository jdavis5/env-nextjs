/**
 * Asserts that input is a non-null object.
 *
 * @param {unknown} value - Input value to check.
 * @param {string} [message] - Optional error message upon failure.
 * @throws {TypeError} Throws if the value is not a non-null object.
 * @returns {asserts value is object}
 */
export function assertObject(value, message) {
    if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        throw new TypeError(message ?? `Must be a non-null object`);
    }
}
