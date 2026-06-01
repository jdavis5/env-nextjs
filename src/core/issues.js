import { formatPath } from './path.js';
import { indent } from './utils/formatting.js';

/**
 * Zod compatibility types.
 *
 * @import { ZCIssue } from './types/zod-compat.js'
 */

/**
 * Pretty-formats a list of Zod validation issues into a human-readable string.
 *
 * Each issue is rendered in the same order as provided.
 * Issues remain flat and ungrouped to maintain clarity and readability.
 * This aligns with the style of Zod 4's `prettifyError` method.
 *
 * @param {object} options - Formatting options.
 * @param {Array<ZCIssue>} options.issues - An list of validation issues to format.
 * @param {string} [options.heading] - Optional heading to prepend the output.
 * @param {number} [options.topIndent=0] - Optional number of spaces to indent at the top level (default 0).
 * @param {number} [options.nestedIndent=2] - Optional number of spaces to indent each nested level (default 2).
 * @returns {string} Pretty-formatted Zod issues.
 */
export function prettifyIssues({ issues, heading, topIndent = 0, nestedIndent = 2 }) {
    if (!issues.length) {
        return '';
    }

    /** @type {Array<string>} */
    const output = [];

    /** @type {Array<string>} */
    const problems = [];

    if (heading) {
        output.push(`${heading}\n`);
    }

    issues.forEach((issue) => {
        if (!issue.path.length) {
            problems.push([indent(`✖ ${issue.message}`, topIndent)].join('\n'));
        } else {
            problems.push(
                [
                    indent(`✖ ${issue.message}`, topIndent),
                    indent(`→ at ${formatPath(issue.path)}`, topIndent + nestedIndent)
                ].join('\n')
            );
        }
    });

    output.push(problems.join('\n\n'));

    return output.join('\n').concat('\n');
}
