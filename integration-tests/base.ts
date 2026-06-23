import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { test } from "vitest";
import { User } from "../src/models/user.js";
import { logger } from "../src/utils/logger.js";

export const integrationTest = test
  .extend("dynamoClient", async () => {
    return new DynamoDBClient({
      region: "eu-west-2",
      ...(process.env.DYNAMO_ENDPOINT && {
        endpoint: process.env.DYNAMO_ENDPOINT,
      }),
    });
  })
  .extend("dynamoDocClient", async ({ dynamoClient }) => {
    return DynamoDBDocument.from(dynamoClient);
  })
  .extend("addUsersToDynamo", ({ dynamoDocClient }) => {
    return async (...users: User[]) => {
      for (const user of users) {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Item: {
            subject: `user:${user.id}`,
            email: user.email,
            name: user.name,
            sk: "user",
          },
        });
      }
    };
  })
  .extend("getUserFromDynamo", ({ dynamoDocClient }) => {
    return async (userId: string) => {
      return (
        await dynamoDocClient.get({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Key: { subject: `user:${userId}` },
        })
      ).Item;
    };
  });

integrationTest.beforeEach(async ({ dynamoClient }) => {
  await createTable(dynamoClient);
});

integrationTest.afterEach(async ({ dynamoClient }) => {
  try {
    await deleteTable(dynamoClient);
  } catch {
    logger.info("Table does not exist");
  }
});

const createTable = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
    AttributeDefinitions: [
      {
        AttributeName: "subject",
        AttributeType: "S",
      },
      {
        AttributeName: "sk",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "subject",
        KeyType: "HASH",
      },
      {
        AttributeName: "sk",
        KeyType: "RANGE",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });
  await dynamoClient.send(command);
};

const deleteTable = async (dynamoClient: DynamoDBClient) => {
  const command = new DeleteTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
  });

  await dynamoClient.send(command);
};
