/* eslint-disable vitest/max-expects */
import { integrationTest } from "../base.js";
import { User } from "../../src/models/user.js";
import { UserPermission } from "../../src/models/permissions.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { createNewServiceWithManagerUserPermissions } from "../../src/datastores/user-permissions-services-data-store.js";
import { Service } from "../../src/models/service.js";
import { randomUUID } from "crypto";

const existingUserId = randomUUID();
const existingUser: User = {
  id: existingUserId,
  name: "Test User",
  email: "test@user.com",
};
const serviceId = randomUUID();
const newService: Service = {
  serviceId: serviceId,
  name: "Test service",
};
const readerUserRelation = {
  userId: existingUserId,
  object: `service:${serviceId}`,
  relation: UserPermission.READER,
};
const writerIntUserRelation = {
  userId: existingUserId,
  object: `service:${serviceId}`,
  relation: UserPermission.WRITER_INT,
};
const managerUserRelation = {
  userId: existingUserId,
  object: `service:${serviceId}`,
  relation: UserPermission.MANAGER,
};
const existingServiceId = randomUUID();
const existingService: Service = {
  serviceId: existingServiceId,
  name: "Test service",
};
const existingUserIdWithExistingRelation = randomUUID();
const existingReaderUserRelation = {
  userId: existingUserIdWithExistingRelation,
  object: `service:${existingServiceId}`,
  relation: UserPermission.READER,
};

describe("user permissions data store tests", () => {
  integrationTest.beforeAll(async ({ addUserToDynamo, addServiceToDynamo }) => {
    await addUserToDynamo(existingUser);
    await addServiceToDynamo(existingService);
  });

  integrationTest.afterAll(
    async ({
      deleteUserFromDynamo,
      deleteServiceFromDynamo,
      deleteUserRelationFromDynamo,
    }) => {
      await deleteUserFromDynamo(existingUser);
      await deleteServiceFromDynamo(existingService);
      await deleteServiceFromDynamo(newService);
      await deleteUserRelationFromDynamo(readerUserRelation);
      await deleteUserRelationFromDynamo(writerIntUserRelation);
      await deleteUserRelationFromDynamo(managerUserRelation);
      await deleteUserRelationFromDynamo(existingReaderUserRelation);
    }
  );

  integrationTest(
    "should create service and add user permission if user exists",
    async ({ getServiceFromDynamo, userPermissionExistsInDynamo }) => {
      await createNewServiceWithManagerUserPermissions(
        newService,
        existingUserId
      );

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
    async () => {
      await expect(
        createNewServiceWithManagerUserPermissions(newService, "fake-user-id")
      ).rejects.toThrow(TransactionCanceledException);
    }
  );

  integrationTest(
    "should fail to add user permission and fail to create service if service already exists",
    async () => {
      await expect(
        createNewServiceWithManagerUserPermissions(
          existingService,
          existingUserId
        )
      ).rejects.toThrow(TransactionCanceledException);
    }
  );

  integrationTest(
    "should fail to add user permission and fail to create service if user permissions already exists",
    async ({ addUserRelationToDynamo }) => {
      await addUserRelationToDynamo(existingReaderUserRelation);

      await expect(
        createNewServiceWithManagerUserPermissions(
          existingService,
          existingUserIdWithExistingRelation
        )
      ).rejects.toThrow(TransactionCanceledException);
    }
  );
});
