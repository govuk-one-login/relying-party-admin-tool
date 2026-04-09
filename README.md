# relying-party-admin-tool

Use `npm ci` to install packages.

## Running tests

### Unit tests

Use `npm run test:unit` to run unit tests.
Use `npm run test:coverage` to see the test coverage from unit tests.

### Integration tests

Use `npm run test:integration` to run integration tests.
Use `npm run test:report` from the integration-tests folder to see the results.
To test one specific file, use `npx playwright test path_to_file` from the integration-tests folder.
To test the last failed tests, use `npx playwright test --last-failed` from the integration-tests folder.
To view the integration tests in the browser as they run, use `npx playwright test --ui` from the integration-tests folder.
To debug tests, use either the ui command above or `npx playwright test --debug` from the integration-tests folder.

#### To run tests locally

Follow the steps below, while running `npm run dev`

#### To run against a deployed environment

Change the url found in integration-tests/utils/getBaseUrl.ts

## Development

You should install the [pre-commit](http://pre-commit.com/) config by running `pre-commit install` in the root of the repository.
