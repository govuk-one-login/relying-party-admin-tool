# relying-party-admin-tool

Use `npm run install-all` to install packages.

## Running tests

### Unit tests

Use `npm run test:unit` to run unit tests.
Use `npm run test:coverage` to see the test coverage from unit tests.

### Integration tests

To run integration tests, read the README in `/integration-tests`.

#### To run tests locally

Follow the steps below, while running `npm run dev` and go to localhost:6001.

#### To run against a deployed environment

Change the url found in integration-tests/utils/getBaseUrl.ts

## Development

You should install the [pre-commit](http://pre-commit.com/) config by running `pre-commit install` in the root of the repository.
