export AWS_ENDPOINT_URL_DYNAMODB=http://localhost:8001
export AWS_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test # pragma: allowlist secret
export AWS_SECRET_ACCESS_KEY=test # pragma: allowlist secret

aws dynamodb put-item \
    --table-name local-user-permissions \
    --item '{
        "subject": {"S": "user:userId"},
        "sk": {"S": "relation#service:1#reader"},
        "object": {"S": "service:1"},
        "relation": {"S": "reader"}
    }'

aws dynamodb put-item \
    --table-name local-user-permissions \
    --item '{
        "subject": {"S": "user:userId"},
        "sk": {"S": "relation#service:2#reader"},
        "object": {"S": "service:2"},
        "relation": {"S": "reader"}
    }'

aws dynamodb put-item \
    --table-name local-services \
    --item '{
        "serviceId": {"S": "1"},
        "sk": {"S": "service"},
        "name": {"S": "Service 1"}
    }'

aws dynamodb put-item \
    --table-name local-services \
    --item '{
        "serviceId": {"S": "2"},
        "sk": {"S": "service"},
        "name": {"S": "Service 2"}
    }'