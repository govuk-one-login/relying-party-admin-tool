import { User } from "../models/user.js";
import { Relation } from "../models/relation.js";
import { dynamoDocClient } from "../utils/dynamo.js";

export const tableName = `${process.env.ENVIRONMENT ?? "test"}-user-permissions`;

export const getUser = async (id: string): Promise<User | undefined> => {
  const result = await dynamoDocClient.get({
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
  const result = await dynamoDocClient.query({
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
  await dynamoDocClient.put({
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

export const addUserPermission = async (relation: Relation): Promise<void> => {
  await dynamoDocClient.transactWrite({
    TransactItems: [
      {
        ConditionCheck: {
          TableName: tableName,
          Key: { subject: `user:${relation.userId}`, sk: "user" },
          ConditionExpression: "attribute_exists(subject)",
        },
      },
      {
        Put: {
          TableName: tableName,
          Item: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
            object: relation.object,
            relation: relation.relation,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
    ],
  });
};
