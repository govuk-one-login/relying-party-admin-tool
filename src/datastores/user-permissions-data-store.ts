import { User } from "../models/user.js";
import { dynamoDocClient } from "../utils/dynamo.js";

export const userPermissionsTableName = `${process.env.ENVIRONMENT ?? "test"}-user-permissions`;

export const getUser = async (id: string): Promise<User | undefined> => {
  const result = await dynamoDocClient.get({
    TableName: userPermissionsTableName,
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
  const result = await dynamoDocClient.query({
    TableName: userPermissionsTableName,
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
  await dynamoDocClient.put({
    TableName: userPermissionsTableName,
    Item: {
      subject: `user:${user.id}`,
      sk: "user",
      email: user.email,
      name: user.name,
    },
    ConditionExpression: "attribute_not_exists(subject)",
  });
};
