import { userPermissionsTableName } from "./user-permissions-data-store.js";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocument, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { servicesTableName } from "./services-data-store.js";
import { UserPermission } from "../models/permissions.js";
import { createNewServiceWithManagerUserPermissions } from "./user-permissions-services-data-store.js";

describe("User permissions services data store tests", () => {
  const mockDynamo = mockClient(DynamoDBDocument);

  beforeEach(() => {
    mockDynamo.reset();
  });

  describe("createNewServiceWithManagerUserPermissions", () => {
    it("should create new service and manager permissions if user exists", async () => {
      const userId = "test-user-id";
      const TEST_SERVICE = {
        serviceId: "test-service-id",
        name: "Test Service",
      };
      const object = `service:${TEST_SERVICE.serviceId}`;

      await createNewServiceWithManagerUserPermissions(TEST_SERVICE, userId);

      const calls = mockDynamo.commandCalls(TransactWriteCommand);

      expect(calls).toHaveLength(1);

      const inputPayload = calls[0].args[0].input;

      expect(inputPayload).toStrictEqual({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: userPermissionsTableName,
              Key: { subject: `user:${userId}`, sk: "user" },
              ConditionExpression: "attribute_exists(subject)",
            },
          },
          {
            Put: {
              TableName: servicesTableName,
              Item: {
                serviceId: TEST_SERVICE.serviceId,
                sk: "service",
                name: TEST_SERVICE.name,
              },
              ConditionExpression: "attribute_not_exists(serviceId)",
            },
          },
          {
            Put: {
              TableName: userPermissionsTableName,
              Item: {
                subject: `user:${userId}`,
                sk: `relation#${object}#${UserPermission.READER}`,
                object,
                relation: UserPermission.READER,
              },
              ConditionExpression: "attribute_not_exists(sk)",
            },
          },
          {
            Put: {
              TableName: userPermissionsTableName,
              Item: {
                subject: `user:${userId}`,
                sk: `relation#${object}#${UserPermission.WRITER_INT}`,
                object,
                relation: UserPermission.WRITER_INT,
              },
              ConditionExpression: "attribute_not_exists(sk)",
            },
          },
          {
            Put: {
              TableName: userPermissionsTableName,
              Item: {
                subject: `user:${userId}`,
                sk: `relation#${object}#${UserPermission.MANAGER}`,
                object,
                relation: UserPermission.MANAGER,
              },
              ConditionExpression: "attribute_not_exists(sk)",
            },
          },
        ],
      });
    });
  });
});
