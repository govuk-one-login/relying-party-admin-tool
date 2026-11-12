#!/bin/bash

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

aws dynamodb create-table \
   --table-name local-services \
   --attribute-definitions \
      AttributeName=serviceId,AttributeType=S \
      AttributeName=sk,AttributeType=S \
   --key-schema \
      AttributeName=serviceId,KeyType=HASH \
      AttributeName=sk,KeyType=RANGE \
   --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
   --table-name local-frontend-sessions \
   --attribute-definitions \
      AttributeName=id,AttributeType=S \
   --key-schema \
      AttributeName=id,KeyType=HASH \
   --provisioned-throughput \
      ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb update-time-to-live \
    --table-name local-frontend-sessions \
    --time-to-live-specification Enabled=true,AttributeName=expires

KEY_ID=$(aws kms create-key \
    --key-usage SIGN_VERIFY \
    --key-spec ECC_NIST_P256 \
    --query 'KeyMetadata.KeyId' --output text)

echo "Created key with ID"

aws kms create-alias \
  --alias-name "alias/local-oidc-signing-key-alias" \
  --target-key-id $KEY_ID
