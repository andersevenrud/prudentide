# Development

## Rules

* Write ECMAScript modules
* Follow ESLint rules
* Database table names and models should be singular
* REST API endpoint resources should be singular
* Folder names should be plural
* Everything is in camelCase except class names
* Always add e2e tests for endpoints
* Always add unit tests where e2e does not reach

## Testing

To run all tests:

```shell
./scripts/npm.sh run test
```

See `coverage/` afterward for in-depth test coverage results.

## Migrations

Run `./scripts/npm.js run db:migrate` to migrate latest database.

Or `./scripts/npm.sh run make:db:migration -- migration_name_here` to make
a migration script.

## Notes

This project runs on ESM modules, which in the current node version is
experimental. This means there are some quirks:

* Node runs the code natively
* Jest runs the code using Babel for now because of
  [lack of ESM mock support](https://github.com/facebook/jest/issues/10025)
* Database migrations use `.cjs` extension to keep compatability between the above
* Jest mocks use `.js` extensions to keep compatability as well
* Some npm package imports require a `default || import` check because they do
  not ship correctly (noted with comments in codebase).

## Profiling

Change your entrypoint script to:

```shell
exec node --prof bin/api.mjs
```

Then after you're done you an inspect them with:

### Text file

```shell
node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
```

### Flame graph

> Requires: `npm install -g flamebearer`

```shell
node --prof-process --preprocess -j isolate0xnnnnnnnnnnnn-v8.log | flamebearer
```

## Benchmarking

Basic example:

> You can get a token via the Swagger UI

```shell
ab -H "authorization: Bearer $MYTOKEN" -c 100 -n 10000 "http://localhost:8080/v1/<endpoint>"
```
