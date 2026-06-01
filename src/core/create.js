import { prettifyIssues } from './issues.js';
import { parseEnvSchema } from './parse.js';
import { assertObject } from './utils/assert.js';
import { isBrowser } from './utils/browser.js';

/**
 * Zod compatibility types.
 *
 * @import { ZCIssue } from './types/zod-compat.js'
 */

/**
 * Environment schema types.
 *
 * @import { ClientRuntime, EnvSchema, PrefixedKeySchema, SchemaOutput } from './types/env-schema.js'
 */

/**
 * Options for creating a server environment object.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {object} ServerEnvOptions
 * @property {'server'} context - Indicates a server context.
 * @property {TSchema} schema - The schema.
 */

/**
 * Options for creating a client environment object.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {object} ClientEnvOptions
 * @property {'client'} context - Indicates a client context.
 * @property {PrefixedKeySchema<TSchema, 'NEXT_PUBLIC_'>} schema - The schema, using keys prefixed with `NEXT_PUBLIC_`.
 * @property {ClientRuntime<TSchema>} clientRuntime - Client runtime values.
 */

/**
 * Configuration options for creating an environment object.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {ServerEnvOptions<TSchema> | ClientEnvOptions<TSchema>} EnvOptions
 */

/**
 * Creates a typed, read-only environment object from the provided schema and options.
 *
 * Environment variables are validated against the provided schema object.
 * If validation fails, errors are logged on the server and an error is thrown.
 *
 * An error is thrown if a 'server' context is used in the browser.
 *
 * The returned object is read-only.
 * Attempts to modify or delete properties will throw an error.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @param {EnvOptions<TSchema>} options - Configuration for creating an environment object.
 * @returns {SchemaOutput<TSchema>} - A validated environment object.
 */
export function createEnv(options) {
    assertObject(options, '❌ Environment configuration must be a non-null object');

    if (options.context !== 'server' && options.context !== 'client') {
        throw new Error("❌ 'context' must be 'server' or 'client'");
    }

    assertObject(options.schema, "❌ 'schema' must be a non-null object");

    if (options.context === 'client') {
        assertObject(options.clientRuntime, "❌ 'clientRuntime' must be a non-null object");
    }

    if (!Object.keys(options.schema).length) {
        console.warn(
            `⚠️ The 'schema' for '${options.context}' is empty and no values will be validated`
        );
    }

    const envRuntime =
        options.context === 'client' && 'clientRuntime' in options
            ? options.clientRuntime
            : (process.env ?? {});

    /**
     * Throws an error indicating an incompatible context.
     *
     * @throws {Error} Always throws an error.
     * @returns {never}
     */
    const onContextViolation = () => {
        throw new Error(`❌ The '${options.context}' context cannot be used in this environment`);
    };

    if (isBrowser() && options.context === 'server') {
        return onContextViolation();
    }

    /**
     * Throws an error indicating an attempt to modify or delete a read-only environment variable.
     *
     * @param {PropertyKey} property
     * @param {'set' | 'delete'} [action] - Optional type of action being performed.
     * @throws {Error} Always throws an error.
     * @returns {never}
     */
    const onReadOnlyViolation = (property, action) => {
        const propertyName = String(property);

        const messages = {
            set: `Cannot set '${propertyName}'`,
            delete: `Cannot delete '${propertyName}'`,
            default: `Cannot modify '${propertyName}'`
        };

        const message = messages[action ?? 'default'];

        throw new TypeError(`❌ ${message}, environment object is read-only`);
    };

    /**
     * Logs schema validation issues for environment variables and throws an error.
     *
     * @param {Array<ZCIssue>} issues - A list of validation issues to log.
     * @throws {Error} Always throws an error.
     * @returns {never}
     */
    const onValidationFailure = (issues) => {
        console.error(
            prettifyIssues({
                issues,
                heading: `❌ Environment validation failed (${options.context}):`,
                topIndent: 3
            })
        );
        throw new Error('Environment validation failed');
    };

    const schema = /** @type {TSchema} */ (options.schema);
    const parsed = parseEnvSchema(schema, envRuntime);

    if (!parsed.success) {
        return onValidationFailure(parsed.issues);
    }

    return new Proxy(parsed.data, {
        get: (target, property) => {
            if (typeof property !== 'string') {
                return undefined;
            }
            return Reflect.get(target, property);
        },
        set: (_target, property) => {
            return onReadOnlyViolation(property, 'set');
        },
        defineProperty: (_target, property) => {
            return onReadOnlyViolation(property, 'set');
        },
        deleteProperty: (_target, property) => {
            return onReadOnlyViolation(property, 'delete');
        }
    });
}
