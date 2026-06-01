/**
 * Checks whether the current runtime environment is a browser.
 *
 * @returns {boolean} `true` if running in a browser, `false` otherwise.
 */
export function isBrowser() {
    return typeof window !== 'undefined';
}
