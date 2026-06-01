import { prependPath } from './path.js';
import { assertObject } from './utils/assert.js';

/**
 * Zod compatibility types.
 *
 * @import { ZCIssue, ZCSafeParseResult, ZCType } from './types/zod-compat.js'
 */

/**
 * Environment schema types.
 *
 * @import { EnvSchema, SchemaOutput } from './types/env-schema.js'
 */

/**
 * Validates a value against the provided schema.
 *
 * Uses synchronous parsing by default and falls back to asynchronous parsing if needed.
 *
 * @template TOutput
 * @param  {ZCType<TOutput>} schema - A schema used to validate the value.
 * @param {unknown} value - A value to validate.
 * @returns {ZCSafeParseResult<TOutput> | Promise<ZCSafeParseResult<TOutput>>} A safe parse result.
 */
function validate(schema, value) {
    try {
        return schema.safeParse(value);
    } catch (_) {
        return schema.safeParseAsync(value);
    }
}

/**
 * The result of a successful environment schema parse.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {object} ParseSchemaSuccess
 * @property {true} success - Indicates the environment schema parse was successful.
 * @property {SchemaOutput<TSchema>} data - The output after parsing.
 */

/**
 * The result of failed environment schema parse.
 *
 * @typedef {object} ParseSchemaFailure
 * @property {false} success - Indicates the environment schema parse was unsuccessful.
 * @property {Array<ZCIssue>} issues - A list of validation issues.
 */

/**
 * Parses an object against a provided environment schema.
 *
 * Each schema entry is validated independently.
 * Returns the parsed data if all entries pass validation, otherwise returns a list of validation issues.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @param {TSchema} schema - An environment schema used for parsing.
 * @param {Record<string, unknown>} value - Object to parse using the environment schema.
 * @returns {ParseSchemaSuccess<TSchema> | ParseSchemaFailure} The result of parsing an environment schema.
 */
export function parseEnvSchema(schema, value) {
    assertObject(schema);
    assertObject(value);

    /** @type {Partial<SchemaOutput<TSchema>>} */
    const output = {};

    /** @type {Array<ZCIssue>}>} */
    const issues = [];

    for (const key in schema) {
        const result = validate(schema[key], value[key]);

        if (result instanceof Promise) {
            issues.push({
                path: [key],
                message: 'Asynchronous validation is unsupported'
            });
            continue;
        }

        if (!result.success) {
            issues.push(...result.error.issues.map((issue) => prependPath(key, issue)));
            continue;
        }

        output[key] = result.data;
    }

    if (issues.length) {
        return {
            success: false,
            issues
        };
    }

    return {
        success: true,
        data: /** @type {SchemaOutput<TSchema>} **/ (output)
    };
}
