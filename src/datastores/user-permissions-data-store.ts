import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { User } from "../models/user.js";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamoClient = DynamoDBDocument.from(
  new DynamoDBClient({
    region: "eu-west-2",
    ...(process.env.DYNAMO_ENDPOINT && {
      endpoint: process.env.DYNAMO_ENDPOINT,
    }),
  }),
);
export const tableName = `${process.env.ENVIRONMENT ?? "test"}-user-permissions`;

export const getUser = async (id: string): Promise<User | undefined> => {
  const result = await dynamoClient.get({
    TableName: tableName,
    Key: { subject: `user:${id}`, sk: "user" },
  });
  if (!result.Item) {
    return;
  }
  return {
    id: result.Item.subject.substring(5), // remove the "user:" bit from subject
    name: result.Item.name,
    email: result.Item.email,
  } as User;
};
