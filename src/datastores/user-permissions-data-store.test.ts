import { getUser } from "./user-permissions-data-store.js";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocument, GetCommand } from "@aws-sdk/lib-dynamodb";

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
