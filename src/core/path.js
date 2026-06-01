/**
 * Zod compatibility types.
 *
 * @import { ZCIssue } from './types/zod-compat.js'
 */

/**
 * Formats a Zod issue path into a human-readable string.
 *
 * @param {ZCIssue['path']} path - The path belonging to the issue.
 * @returns {string} A readable string representing a Zod issue path.
 */
export function formatPath(path) {
    if (!path.length) {
        return '';
    }

    return path
        .map((value, i) => {
            return typeof value === 'number' ? `[${value}]` : `${i > 0 ? '.' : ''}${String(value)}`;
        })
        .join('');
}

/**
 * Prepends an alphanumeric segment to a Zod issue path.
 *
 * @param {ZCIssue['path'][number]} segment - The path segment to prepend.
 * @param {ZCIssue} issue - The issue object to update.
 * @returns {ZCIssue} The updated issue object.
 */
export function prependPath(segment, issue) {
    return {
        ...issue,
        path: [segment, ...issue.path]
    };
}
