#!/bin/bash

export AWS_ENDPOINT_URL_DYNAMODB=http://localhost:8001
export AWS_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test # pragma: allowlist secret
export AWS_SECRET_ACCESS_KEY=test # pragma: allowlist secret

aws dynamodb delete-item \
    --table-name local-user-permissions \
    --key '{
        "subject": { "S": "user:test-user-id"},
        "sk": { "S": "relation#service:123#reader"}
    }'
