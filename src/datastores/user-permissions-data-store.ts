import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { User } from "../models/user.js";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamoClient = DynamoDBDocument.from(
  new DynamoDBClient({
    region: "eu-west-2",
    ...(process.env.DYNAMO_ENDPOINT && {
      endpoint: process.env.DYNAMO_ENDPOINT,
    }),
  })
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

export const getServicesWithRelationForUser = async (
  id: string,
  relation: string
): Promise<string[]> => {
  const result = await dynamoClient.query({
    TableName: tableName,
    KeyConditionExpression: "subject = :pk AND begins_with(sk, :prefix)",
    FilterExpression: "relation = :relation",
    ExpressionAttributeValues: {
      ":pk": `user:${id}`,
      ":relation": relation,
      ":prefix": "relation#service:",
    },
    ExpressionAttributeNames: { "#object": "object" },
    ProjectionExpression: "#object",
  });
  if (!result.Items) {
    return [];
  }
  return result.Items.map((item) => item["object"]).map(
    (service) => service.split(":")[1]
  );
};

export const createUser = async (user: User): Promise<void> => {
  await dynamoClient.put({
    TableName: tableName,
    Item: {
      subject: `user:${user.id}`,
      sk: "user",
      email: user.email,
      name: user.name,
    },
    ConditionExpression: "attribute_not_exists(subject)",
  });
};
