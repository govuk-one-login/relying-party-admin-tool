/* eslint-disable vitest/max-expects */
import { integrationTest, setupAllTables } from "./base.js";
import { User } from "../src/models/user.js";
import { UserPermission } from "../src/models/permissions.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { createNewServiceWithManagerUserPermissions } from "../src/datastores/user-permissions-services-data-store.js";
import { Service } from "../src/models/service.js";

const userId = "test-user-id";
const existingUser: User = {
  id: userId,
  name: "Test User",
  email: "test@user.com",
};
const serviceId = "test-service-id";
const newService: Service = {
  serviceId: serviceId,
  name: "Test service",
};
const readerUserRelation = {
  userId,
  object: `service:${serviceId}`,
  relation: UserPermission.READER,
};
const writerIntUserRelation = {
  userId,
  object: `service:${serviceId}`,
  relation: UserPermission.WRITER_INT,
};
const managerUserRelation = {
  userId,
  object: `service:${serviceId}`,
  relation: UserPermission.MANAGER,
};

describe("user permissions data store tests", () => {
  setupAllTables();

  integrationTest(
    "should create service and add user permission if user exists",
    async ({
      addUserToDynamo,
      getServiceFromDynamo,
      userPermissionExistsInDynamo,
    }) => {
      await addUserToDynamo(existingUser);

      await createNewServiceWithManagerUserPermissions(newService, userId);

      const actualService = await getServiceFromDynamo(serviceId);

      expect(actualService).toStrictEqual({
        serviceId: newService.serviceId,
        name: newService.name,
        sk: "service",
      });
      await expect(
        userPermissionExistsInDynamo(readerUserRelation)
      ).resolves.toBe(true);
      await expect(
        userPermissionExistsInDynamo(writerIntUserRelation)
      ).resolves.toBe(true);
      await expect(
        userPermissionExistsInDynamo(managerUserRelation)
      ).resolves.toBe(true);
    }
  );

  integrationTest(
    "should fail to add user permission and fail to create service if user does not exist",
    async ({ getServiceFromDynamo, userPermissionExistsInDynamo }) => {
      await expect(
        createNewServiceWithManagerUserPermissions(newService, userId)
      ).rejects.toThrow(TransactionCanceledException);

      const actualService = await getServiceFromDynamo("test-service");

      expect(actualService).toBeUndefined();
      await expect(
        userPermissionExistsInDynamo(readerUserRelation)
      ).resolves.toBe(false);
      await expect(
        userPermissionExistsInDynamo(writerIntUserRelation)
      ).resolves.toBe(false);
      await expect(
        userPermissionExistsInDynamo(managerUserRelation)
      ).resolves.toBe(false);
    }
  );
});
