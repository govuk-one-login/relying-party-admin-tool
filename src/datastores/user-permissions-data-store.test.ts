import {
  getServicesWithRelationForUser,
  getUser,
} from "./user-permissions-data-store.js";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocument,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_PREFIX = "test";
const TEST_USER = {
  id: "test-user-id",
  email: "test@email.com",
  name: "Test User",
};

describe("user permissions store tests", () => {
  const mockDynamo = mockClient(DynamoDBDocument);

  beforeEach(() => {
    mockDynamo.reset();
  });

  describe("getUser", () => {
    it("should get user by ID when user exists in dynamo", async () => {
      mockDynamo
        .on(GetCommand, {
          TableName: `${TABLE_PREFIX}-user-permissions`,
          Key: {
            subject: "user:test-user-id",
            sk: "user",
          },
        })
        .resolves({
          Item: {
            subject: "user:test-user-id",
            sk: "user",
            email: TEST_USER.email,
            name: TEST_USER.name,
          },
        });

      const result = await getUser("test-user-id");

      expect(result).toStrictEqual(TEST_USER);
    });

    it("should get no user if user does not exist with ID", async () => {
      mockDynamo
        .on(GetCommand, {
          TableName: `${TABLE_PREFIX}-user-permissions`,
          Key: {
            subject: "user:not-a-user-id",
            sk: "user",
          },
        })
        .resolves({});

      const result = await getUser("not-a-user-id");

      expect(result).toBeUndefined();
    });
  });

  describe("getServicesWithRelationForUser", () => {
    it("should get service IDs by userId and relation when client exists in dynamo", async () => {
      const userId = "test-user-id";
      const relation = "reader";

      mockDynamo
        .on(QueryCommand, {
          TableName: `${TABLE_PREFIX}-user-permissions`,
          KeyConditionExpression: "subject = :pk AND begins_with(sk, :prefix)",
          FilterExpression: "relation = :relation",
          ExpressionAttributeValues: {
            ":pk": `user:${userId}`,
            ":relation": relation,
            ":prefix": "relation#service:",
          },
          ExpressionAttributeNames: { "#object": "object" },
          ProjectionExpression: "#object",
        })
        .resolves({
          Items: [
            {
              subject: "user:test-user-id",
              sk: "relation#service:1#reader",
              object: "service:1",
              relation: "reader",
            },
            {
              subject: "user:test-user-id",
              sk: "relation#service:2#reader",
              object: "service:2",
              relation: "reader",
            },
          ],
        });

      const result = await getServicesWithRelationForUser(userId, relation);

      expect(result).toStrictEqual(["1", "2"]);
    });

    it("should get no service IDs if relation does not exist with userId", async () => {
      const userId = "test-user-id";
      const relation = "reader";

      mockDynamo
        .on(QueryCommand, {
          TableName: `${TABLE_PREFIX}-user-permissions`,
          KeyConditionExpression: "subject = :pk AND begins_with(sk, :prefix)",
          FilterExpression: "relation = :relation",
          ExpressionAttributeValues: {
            ":pk": `user:${userId}`,
            ":relation": relation,
            ":prefix": "relation#service:",
          },
          ExpressionAttributeNames: { "#object": "object" },
          ProjectionExpression: "#object",
        })
        .resolves({ Items: [] });

      const result = await getServicesWithRelationForUser(userId, relation);

      expect(result).toHaveLength(0);
    });
  });
});
