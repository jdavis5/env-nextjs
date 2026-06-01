# Validating environment variables

- [Introduction](#introduction)
- [Getting started](#getting-started)
- [Environment variables in Next.js](#environment-variables-in-nextjs)
- [Separation of server and client](#separation-of-server-and-client)
- [Creating environment definitions](#creating-environment-definitions)
- [Validation behaviour](#validation-behaviour)
- [Using environment objects](#using-environment-objects)

## Introduction

Build-time validation of environment variables in [Next.js](https://nextjs.org/) ensures that all required environment variables are defined and conform to an expected format, preventing runtime errors caused by misconfiguration.

Using schemas for validation helps enforce a clear separation between server-only and client-safe environment variables, minimising the risk of exposing sensitive server-side information in client-side code. Schemas defined with [Zod](https://zod.dev/) provide type safety, detailed error messages, and enhanced TypeScript support.

This package focuses on validation exclusively using Zod. It uses a lightweight compatibility layer to ensure stable behaviour and normalised output across major Zod releases and is compatible with both JavaScript and TypeScript projects.

## Getting started

This package is ESM-only. Projects must use ES modules by setting `"type": "module"` in `package.json`, or by using `.mjs` or `.mts` files.

### Installation

This package is distributed as a prebuilt tarball included with each GitHub release and can be installed using the tarball URL.

- See the [latest release](https://github.com/jdavis5/env-nextjs/releases/latest) (recommended)
- See [all available releases](https://github.com/jdavis5/env-nextjs/releases)

> [!IMPORTANT]  
> Packages installed from a tarball will not automatically update to newer versions.

#### Example (pnpm)

```sh
pnpm add --save-dev https://github.com/jdavis5/env-nextjs/releases/download/1.0.0/env-nextjs-1.0.0.tgz
```

### Compatibility

This package supports the following versions of Zod:

- Zod v3
- Zod v4

## Environment variables in Next.js

Environment variables are accessible at runtime in [Node.js](https://nodejs.org/) via `process.env`. JavaScript running in the browser does not use the Node.js runtime and does not have environment variables available at runtime. For environment variables to be available in the browser, they must be included as literals in the client bundle.

Next.js handles environment variables differently depending on where the code is executed:

- In server-side code, environment variables are accessed at runtime via `process.env`.
- In client-side code, environment variable references are substituted with their literal values at build time and included in the client bundle sent to the browser.

> [!NOTE]  
> For more information on environment variable handling, see the [Next.js documentation](https://nextjs.org/docs/app/guides/environment-variables).

### Build-time substitution

During the Next.js build process, references to environment variables in client-side code are substituted with literal values in the client bundle sent to the browser, ensuring that values are available at runtime.

Substitution only occurs if the environment variable is defined and correctly prefixed, see [Prefixing environment variables for the browser](#prefixing-environment-variables-for-the-browser).

Build-time substitution does not guarantee that environment variable names are removed from the client bundle. Environment variables referenced in client-side code should be considered as publicly visible.

To protect sensitive server-side environment variables, runtime contexts must remain separated, see [Separation of server and client](#separation-of-server-and-client).

> [!NOTE]  
> Following the removal of static analysis of `process.env` in [Next.js 13.4.4](https://github.com/vercel/next.js/releases/tag/v13.4.4), build-time substitution now applies only to environment variable references used in client-side code.

### Prefixing environment variables for the browser

The `NEXT_PUBLIC_` prefix was introduced in [Next.js 9.4](https://nextjs.org/blog/next-9-4#new-environment-variables-support) to explicitly designate which environment variables can be replaced with literal values and included in the client bundle sent to the browser. This removed the ambiguity in handling environment variables under the [legacy API](https://nextjs.org/docs/app/api-reference/config/next-config-js/env).

> [!IMPORTANT]  
> Never use the `NEXT_PUBLIC_` prefix for environment variables that contain sensitive values, see [Protecting sensitive environment variables](#protecting-sensitive-environment-variables).

For [build-time substitution](#build-time-substitution) to occur in client-side code, environment variables that are intended for the browser must have the `NEXT_PUBLIC_` prefix. Any environment variables without this prefix or that are undefined will not be substituted with literal values.

> [!NOTE]  
> For detailed information on how Next.js bundles environment variables for the browser, see the [Next.js documentation](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser).

## Separation of server and client

### Separation of runtime contexts

A combined schema of server and client environment variables would reveal unnecessary information across contexts and allow client-side code to incorrectly reference server-only variables.

Importing an environment object into client-side code causes its environment definition to be included in the build output for the client bundle, exposing schemas and variable names that might be sensitive.

To maintain a clear separation of concerns, server and client environments should be kept in separate files and imported only in the runtime context where they are intended to be used.

- The server environment includes both server-only values and any client-safe values needed on the server.
- The client environment includes only values that are safe to expose to the browser.

The separation of server and client should also be applied at the module level. Concerns should be isolated, and each module should only import the environment object appropriate to its runtime.

When a client-safe environment variable is referenced in both server-side and client-side code, its schema must be declared in both the server definition and the client definition. These declarations must remain synchronised to ensure consistency between runtime contexts.

### Protecting sensitive environment variables

Only environment variables prefixed with `NEXT_PUBLIC_` are considered safe for use in client-side code. Environment variables that might contain sensitive information should not be prefixed.

Server-only environment variables must not be referenced in client-side code. Non-prefixed variables are not substituted at build time, leaving their names in the client bundle. Importing an environment object into client-side code causes its environment definition to be included in the build output for the client bundle, exposing schemas and variable names that might be sensitive.

To prevent sensitive information from being exposed in the client bundle an additional safeguard causes references to server-only environment variables in client-side code to throw an error.

## Creating environment definitions

An environment definition is used to produce an environment object containing validated environment variables, which can then be imported into the relevant context. Each environment definition specifies the expected variables and validation rules for a given runtime context. Each runtime context requires a separate definition, see [Separation of runtime contexts](#separation-of-runtime-contexts).

A typical project could be organised as follows:

```sh
example-app/
├─ env/
│ ├─ client.ts  # Client environment
│ ├─ server.ts  # Server environment
│ └─ schemas.ts # Reusable schemas
└─ ...
```

> [!NOTE]  
> For details on how environment variables are validated, see [Validation behaviour](#validation-behaviour).

### Environment variable schemas

Environment variables in `process.env` are always strings. These values should be coerced or transformed into the correct type before applying further validation.

```ts
const numberSchema = z.number().int().positive()
```

The above Zod schema can be implemented in several ways.

Using `.coerce` (Zod v3.20.0+):

```ts
const numberSchema = z.coerce.number().int().positive()
```

Using `.preprocess` (Zod v3.8.0+):

```ts
const numberSchema = z.preprocess(
  (value) => Number(value),
  z.number().int().positive()
)
```

Using `.transform` with `.pipe` (Zod v3.20.0+):

```ts
const numberSchema = z
  .string()
  .transform(Number)
  .pipe(z.number().int().positive())
```

Using `.transform` with `.refine`:

```ts
const numberSchema = z
  .string()
  .transform(Number)
  .refine((value) => Number.isInteger(value) && value > 0, {
    message: 'Must be a positive integer'
  })
```

### Schema objects

The `schema` is a plain object that defines how each environment variable should be validated using [Zod](https://zod.dev/):

- Each key must match the name of an environment variable.
- Each value must be a valid Zod schema for the environment variable.

For example, given the following `.env` file:

```text
URL=https://example.com
PORT=8080
```

The `schema` object can be defined as:

```ts
// Zod v4

schema: {
  URL: z.url(),
  PORT: z.coerce.number().int()
}
```

### Ensuring build-time substitution for client environment objects

When using validated environment variables in client-side code, references to `process.env` that would normally be substituted at build time are accessed indirectly via the imported environment object.

To enable build-time substitution, every `process.env` reference used in client-side code must be preserved in the environment definition. The client environment object includes a `clientRuntime` property, linking each environment variable to its corresponding `process.env` value.

```ts
// Zod v4

context: 'client',
schema: {
  NEXT_PUBLIC_CDN_URL: z.url()
},
clientRuntime: {
  NEXT_PUBLIC_CDN_URL: process.env['NEXT_PUBLIC_CDN_URL']
}
```

> [!IMPORTANT]  
> Every key defined in `schema` must also be present in `clientRuntime`. Omitting a key will result in a type error.

### Defining the client environment

`env/client.ts`

A client environment only includes environment variables that are safe to expose in the browser.

The following applies to the client environment:

- Environment variables defined in `schema` must be prefixed with `NEXT_PUBLIC_`. Entries without this prefix result in a type error.
- Each key defined in `schema` must have a corresponding entry in `clientRuntime`. Missing entries result in a type error.
- Entries in `clientRuntime` should reference the corresponding `process.env` property to ensure build-time substitution.

```ts
// Zod v4

import { createEnv } from 'env-nextjs'
import { z } from 'zod'

const client = createEnv({
  context: 'client',
  schema: {
    NEXT_PUBLIC_ENABLE_BETA: z.stringbool()
  },
  clientRuntime: {
    NEXT_PUBLIC_ENABLE_BETA: process.env['NEXT_PUBLIC_ENABLE_BETA']
  }
})

export default client
```

### Defining the server environment

`env/server.ts`

The server schema may additionally include client-safe variables, as these can be accessed at runtime on the server.

```ts
// Zod v4

import { createEnv } from 'env-nextjs'
import { z } from 'zod'

const server = createEnv({
  context: 'server',
  schema: {
    NEXT_PUBLIC_ENABLE_BETA: z.stringbool(),
    API_BASE_URL: z.url(),
    API_KEY: z.string(),
    API_BASE_URL_STAGING: z.url()
  }
})

export default server
```

## Validation behaviour

Validation of environment variables occurs whenever an environment object is evaluated as part of the Next.js build process. Validation uses the `schema` provided in the corresponding environment definition. Unused imports of environment objects are tree-shaken and validation cannot occur.

Validation failures terminate the Next.js build process and any issues are reported in the terminal.

> [!IMPORTANT]  
> Accessing a server-only environment variable within client-side code will throw an error, see [Protecting sensitive environment variables](#protecting-sensitive-environment-variables).

### Validating on build

In Next.js development mode, validation is delayed until the application code that imports the environment object is compiled, potentially delaying error detection.

Since `next.config.js` is always evaluated during the build process, importing the required environment definition files into it guarantees build-time validation and aligns development and production behaviour.

### Legacy API behaviour

To support environment variables prior to [Next.js 9.4](https://nextjs.org/blog/next-9-4#new-environment-variables-support) and maintain backward compatibility, environment variables can be defined in `next.config.js` using the `env` property. This is considered a legacy API and its use is not recommended. For more information, see the [Next.js legacy API reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/env).

Environment variables defined in `next.config.js` are always included in the client bundle and take precedence over any corresponding values from `.env` files at build time. Validation occurs against these overridden values and will fail if they do not conform to the schema.

Discrepancies between `next.config.js` values and those from `.env` files or the runtime environment may produce unexpected behaviour.

> [!IMPORTANT]  
> Using `next.config.js` to define environment variables is incompatible with schema validation.

## Using environment objects

Environment objects contain the validated environment variables produced from an environment definition, see [Creating environment definitions](#creating-environment-definitions).

These objects are read-only to prevent modification or deletion of validated values.

> [!IMPORTANT]  
> Do not copy the environment object. Always use the imported object to preserve validation guarantees.

An environment object should only be imported into the runtime context for which it was created to ensure server and client concerns remain properly isolated, see [Separation of runtime contexts](#separation-of-runtime-contexts).

### Usage on the server

```ts
import env from 'env/server'

export function getApiBaseUrl() {
  return env['NEXT_PUBLIC_ENABLE_BETA']
    ? env['API_BASE_URL_STAGING']
    : env['API_BASE_URL']
}
```

### Usage on the client

```ts
import env from "env/client";

export function ProfileCard(props) {
  if (env["NEXT_PUBLIC_ENABLE_BETA"]) {
    return <ProfileCardBeta {...props} />;
  }
  return <ProfileCardDefault {...props} />;
}
```

> [!IMPORTANT]  
> Attempting to access server-only variables in client-side code will throw an error, see [Protecting sensitive environment variables](#protecting-sensitive-environment-variables).
