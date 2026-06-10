#!/bin/bash

export AWS_ENDPOINT_URL_DYNAMODB=http://host.docker.internal:8001
export AWS_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test # pragma: allowlist secret
export AWS_SECRET_ACCESS_KEY=test # pragma: allowlist secret

aws dynamodb create-table \
   --table-name local-user-permissions \
   --attribute-definitions \
      AttributeName=subject,AttributeType=S \
      AttributeName=sk,AttributeType=S \
   --key-schema \
      AttributeName=subject,KeyType=HASH \
      AttributeName=sk,KeyType=RANGE \
   --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5
