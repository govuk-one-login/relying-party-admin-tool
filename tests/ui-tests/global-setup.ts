import {
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { FullConfig } from "@playwright/test";
import { getTestServiceId } from "./utils/getTestServiceId";

const client = new DynamoDBClient({
  region: "eu-west-2",
  endpoint: process.env.DYNAMO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const dynamoDBDocument = DynamoDBDocument.from(client);

const createTableIfNotExists = async (params: any) => {
  try {
    await client.send(new CreateTableCommand(params));
  } catch (err: any) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};

const addServiceToTableIfNotExists = async () => {
  try {
    await dynamoDBDocument.put({
      TableName: `${process.env.ENVIRONMENT}-services`,
      Item: {
        serviceId: getTestServiceId(),
        sk: "service",
        name: "Test service",
      },
      ConditionExpression: "attribute_not_exists(serviceId)",
    });
  } catch (err: any) {
    if (err.name !== "ConditionalCheckFailedException") {
      throw err;
    }
  }
};

const globalSetup = async (config: FullConfig) => {
  await createTableIfNotExists({
    TableName: `${process.env.ENVIRONMENT}-user-permissions`,
    AttributeDefinitions: [
      { AttributeName: "subject", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "subject", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await createTableIfNotExists({
    TableName: `${process.env.ENVIRONMENT}-services`,
    AttributeDefinitions: [
      { AttributeName: "serviceId", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "serviceId", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  await addServiceToTableIfNotExists();

  await createTableIfNotExists({
    TableName: `${process.env.ENVIRONMENT}-frontend-sessions`,
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  });

  try {
    await client.send(
      new UpdateTimeToLiveCommand({
        TableName: `${process.env.ENVIRONMENT}-frontend-sessions`,
        TimeToLiveSpecification: {
          Enabled: true,
          AttributeName: "expires",
        },
      })
    );
  } catch (err) {}
};

export default globalSetup;
