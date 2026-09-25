import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { FullConfig } from "@playwright/test";
import { getTestServiceId } from "./utils/getTestServiceId";

const client = new DynamoDBClient({
  region: "eu-west-2",
  ...(process.env.DYNAMO_ENDPOINT && {
    endpoint: process.env.DYNAMO_ENDPOINT,
  }),
});

const deleteDataFromTable = async (deleteItemCommand: DeleteItemCommand) => {
  try {
    await client.send(deleteItemCommand);
  } catch (err: any) {
    if (err.name !== "ConditionalCheckFailedException") {
      throw err;
    }
  }
};

const globalTeardown = async (config: FullConfig) => {
  await deleteDataFromTable(
    new DeleteItemCommand({
      TableName: `${process.env.ENVIRONMENT}-services`,
      Key: {
        serviceId: { S: getTestServiceId() },
        sk: { S: "service" },
      },
    })
  );

  await deleteDataFromTable(
    new DeleteItemCommand({
      TableName: `${process.env.ENVIRONMENT}-user-permissions`,
      Key: {
        subject: { S: "user:userId" },
        sk: { S: `relation#service:${getTestServiceId()}#reader` },
      },
    })
  );

  await deleteDataFromTable(
    new DeleteItemCommand({
      TableName: `${process.env.ENVIRONMENT}-user-permissions`,
      Key: {
        subject: { S: "user:userId" },
        sk: { S: `relation#service:${getTestServiceId()}#writer_int` },
      },
    })
  );

  await deleteDataFromTable(
    new DeleteItemCommand({
      TableName: `${process.env.ENVIRONMENT}-user-permissions`,
      Key: {
        subject: { S: "user:userId" },
        sk: { S: `relation#service:${getTestServiceId()}#manager` },
      },
    })
  );
};

export default globalTeardown;
