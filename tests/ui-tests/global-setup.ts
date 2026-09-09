import {
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { FullConfig } from "@playwright/test";
import { env } from "./env";

const client = new DynamoDBClient({
  region: "eu-west-2",
  endpoint: process.env.DYNAMO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const createTableIfNotExists = async (params: any) => {
  try {
    await client.send(new CreateTableCommand(params));
  } catch (err: any) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};

const addDataToTable = async (params: any) => {
  try {
    await client.send(new PutItemCommand(params));
  } catch (err: any) {
    if (err.name !== "ConditionalCheckFailedException") {
      throw err;
    }
  }
};

const globalSetup = async (config: FullConfig) => {
  if (env.TEST_TARGET === "local") {
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
  }

  await addDataToTable({
    TableName: `${process.env.ENVIRONMENT}-services`,
    Item: {
      serviceId: { S: "1" },
      sk: { S: "service" },
      name: { S: "Service 1" },
    },
  });

  await addDataToTable({
    TableName: `${process.env.ENVIRONMENT}-services`,
    Item: {
      serviceId: { S: "2" },
      sk: { S: "service" },
      name: { S: "Service 2" },
    },
  });

  await addDataToTable({
    TableName: `${process.env.ENVIRONMENT}-user-permissions`,
    Item: {
      subject: { S: "user:userId" },
      sk: { S: "relation#service:1#reader" },
      object: { S: "service:1" },
      relation: { S: "reader" },
    },
  });

  await addDataToTable({
    TableName: `${process.env.ENVIRONMENT}-user-permissions`,
    Item: {
      subject: { S: "user:userId" },
      sk: { S: "relation#service:2#reader" },
      object: { S: "service:2" },
      relation: { S: "reader" },
    },
  });
};

export default globalSetup;
