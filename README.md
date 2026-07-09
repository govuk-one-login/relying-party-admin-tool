# relying-party-admin-tool

Use `npm run install-all` to install packages.

## Running tests

### Unit tests

Use `npm run test:unit` to run unit tests.
Use `npm run test:coverage` to see the test coverage from unit tests.

### UI tests

To run UI tests, read the README in `/tests/ui-tests`.

### Integration tests

To run integration tests, you need to run DynamoDBLocal first:

```bash
npm run dynamodblocal:up # This only needs to be done once
npm run test:integration
```

## Running the application locally

Copy the file `.env.example` to `.env`.

Note that before you run the application locally you need to create the tables in DynamoDBLocal. There is a script you can use to do this and it only has to be run if a new database has been created since the last time you ran it.

```bash
npm run dynamodblocal:up
./scripts/create-local-tables.sh
```

Then you can run `npm run dev` and go to localhost:6001. You may need to run `npm run build` befoer to get new frontend changes.

## Running the application against a deployed environment

Change the url found in tests/ui-tests/utils/getBaseUrl.ts

## Development

You should install the [pre-commit](http://pre-commit.com/) config by running `pre-commit install` in the root of the repository.

## Pipeline tests

To test pipeline tests, you can run them against dev. This requires a few small infra changes

- Add "dev" to the list of environments where the TestImageRepository properties are defined in the `pipelines.tf` file.

```
TestImageRepositoryNames        = contains(["dev", "build"], var.environment) ? var.repository_name : ""
TestImageRepositoryUri          = contains(["dev", "build"], var.environment) ? aws_cloudformation_stack.test_image_ecr_stack.outputs["TestRunnerImageEcrRepositoryUri"] : "none"
```

- Follow the infra README to deploy these changes to dev.
- Run the deploy to dev GHA manually for your branch, and tick the `Push test image` box.

The test step in the pipeline should run now! To revert the pipeline changes just revert the changes you made to `pipelines.tf` and deploy them to dev again.
