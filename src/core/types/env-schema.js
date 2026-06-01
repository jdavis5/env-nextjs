export {};

/**
 * Zod compatibility types.
 *
 * @import { ZCOutput, ZCType } from './zod-compat.js'
 */

/**
 * An environment schema definition.
 *
 * @typedef {Record<string, ZCType<any>>} EnvSchema
 */

/**
 * Runtime values for client-side environment variables.
 *
 * Ensures that all keys defined in the schema are present and have values suitable for use in client code.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {{ [K in keyof TSchema]: string | boolean | number | undefined }} ClientRuntime
 */

/**
 * Ensures that keys of the schema are prefixed with a given string.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @template {string} TPrefix - The required string prefix for schema keys.
 * @typedef {keyof TSchema extends `${TPrefix}${string}`
 *   ? TSchema
 *   : `Prefix should be ${TPrefix}`
 * } PrefixedKeySchema
 */

/**
 * Infers the parsed output types of the environment schema.
 *
 * @template {EnvSchema} TSchema - The environment schema.
 * @typedef {{ [K in keyof TSchema]: ZCOutput<TSchema[K]> } & {}} SchemaOutput
 */
