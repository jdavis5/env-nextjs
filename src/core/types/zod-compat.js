export {};

/**
 * Minimal Zod validation issue.
 *
 * @typedef {object} ZCIssue
 * @property {Array<PropertyKey>} path - A list of keys and indices showing where the issue occurred.
 * @property {string} message - A description of the issue.
 */

/**
 * Minimal Zod error properties.
 *
 * @typedef {object} $ZCErrorProps
 * @property {Array<ZCIssue>} issues - A list of validation issues.
 */

/**
 * A minimal Zod error.
 *
 * @typedef {Error & $ZCErrorProps } ZCError
 */

/**
 * A successful safe parse result.
 *
 * @template TOutput - The type returned after successful parsing.
 * @typedef {object} ZCSafeParseSuccess
 * @property {true} success - Indicates the parse was successful.
 * @property {TOutput} data - The output after parsing.
 */

/**
 * A failed safe parse result.
 *
 * @typedef {object} ZCSafeParseError
 * @property {false} success - Indicates the parse was unsuccessful.
 * @property {ZCError} error - The error resulting from the failed parse.
 */

/**
 * The result of a safe parse.
 *
 * @template TOutput
 * @typedef {ZCSafeParseSuccess<TOutput> | ZCSafeParseError} ZCSafeParseResult
 */

/**
 * A minimal Zod `safeParse` method.
 *
 * @template TOutput - The type returned after successful parsing.
 * @callback ZCSafeParse
 * @param {unknown} input - The value to parse.
 * @returns {ZCSafeParseResult<TOutput>} - The result of a synchronous safe parse.
 */

/**
 * A minimal Zod `safeParseAsync` method.
 *
 * @template TOutput - The type returned after successful parsing.
 * @callback ZCSafeParseAsync
 * @param {unknown} input - The value to parse.
 * @returns {Promise<ZCSafeParseResult<TOutput>>} - The result of an asynchronous safe parse.
 */

/**
 * A minimal Zod type.
 *
 * Any object exposing the following methods is considered valid:
 * - `safeParse`
 * - `safeParseAsync`
 *
 * @template [TOutput=unknown] - The type returned after successful parsing.
 * @typedef {object} ZCType
 * @property {ZCSafeParse<TOutput>} safeParse - Performs a synchronous safe parse on input.
 * @property {ZCSafeParseAsync<TOutput>} safeParseAsync - Performs an asynchronous safe parse on input.
 */

/**
 * Infers the output type from a Zod type.
 *
 * @template TSchema - The schema from which to extract the successful output type.
 * @typedef {TSchema extends ZCType<infer R> ? R : never} ZCOutput
 */
