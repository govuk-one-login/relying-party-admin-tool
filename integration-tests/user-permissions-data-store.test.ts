/* eslint-disable vitest/max-expects */
import { integrationTest, setupUserPermissionsTable } from "./base.js";
import { User } from "../src/models/user.js";
import {
  addUserPermission,
  createUser,
  getServicesWithRelationForUser,
  getUser,
} from "../src/datastores/user-permissions-data-store.js";
import { Relation } from "../src/models/relation.js";
import { UserPermission } from "../src/models/permissions.js";
import {
  ConditionalCheckFailedException,
  TransactionCanceledException,
} from "@aws-sdk/client-dynamodb";

describe("user permissions data store tests", () => {
  setupUserPermissionsTable();
  integrationTest(
    "should get user from table by ID if user exists",
    async ({ addUserToDynamo }) => {
      const existingUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@user.com",
      };
      await addUserToDynamo(existingUser);

      const user = await getUser("test-user-id");

      expect(user).toStrictEqual(existingUser);
    }
  );

  integrationTest(
    "should not get user if user with ID does not exist",
    async () => {
      const user = await getUser("not-a-user-id");

      expect(user).toBeUndefined();
    }
  );

  integrationTest(
    "should get services with relation from table by ID if user exists",
    async ({ addUserRelationToDynamo }) => {
      const relationServiceId1 = "1";
      const existingRelation1: Relation = {
        userId: "test-user-id",
        object: `service:${relationServiceId1}`,
        relation: UserPermission.READER,
      };
      const relationServiceId2 = "2";
      const existingRelation2: Relation = {
        userId: "test-user-id",
        object: `service:${relationServiceId2}`,
        relation: UserPermission.READER,
      };
      await addUserRelationToDynamo(existingRelation1);
      await addUserRelationToDynamo(existingRelation2);

      const relation = await getServicesWithRelationForUser(
        "test-user-id",
        UserPermission.READER
      );

      expect(relation).toStrictEqual([relationServiceId1, relationServiceId2]);
    }
  );

  integrationTest(
    "should create user if user does not exist",
    async ({ getUserFromDynamo }) => {
      const expectedUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@email.com",
      };
      await createUser(expectedUser);

      const actualUser = await getUserFromDynamo(expectedUser.id);

      expect(expectedUser).toStrictEqual(actualUser);
    }
  );

  integrationTest(
    "should fail to create user if user already exists with id",
    async ({ addUserToDynamo }) => {
      const existingUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@email.com",
      };
      await addUserToDynamo(existingUser);

      await expect(createUser(existingUser)).rejects.toThrow(
        ConditionalCheckFailedException
      );
    }
  );

  integrationTest(
    "should add user permission if user exists",
    async ({ addUserToDynamo, userPermissionExistsInDynamo }) => {
      const existingUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@user.com",
      };
      await addUserToDynamo(existingUser);

      const relation: Relation = {
        userId: "test-user-id",
        object: `service:123`,
        relation: UserPermission.READER,
      };
      await addUserPermission(relation);

      await expect(userPermissionExistsInDynamo(relation)).resolves.toBe(true);
    }
  );

  integrationTest(
    "should fail to add user permission if user does not exist",
    async () => {
      const relation: Relation = {
        userId: "user-that-does-not-exist",
        object: `service:123`,
        relation: UserPermission.READER,
      };

      await expect(addUserPermission(relation)).rejects.toThrow(
        TransactionCanceledException
      );
    }
  );

  integrationTest(
    "should fail to add user permission if permission already exists",
    async ({ addUserToDynamo, addUserRelationToDynamo }) => {
      const existingUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@user.com",
      };
      await addUserToDynamo(existingUser);

      const existingRelation: Relation = {
        userId: "test-user-id",
        object: `service:123`,
        relation: UserPermission.READER,
      };
      await addUserRelationToDynamo(existingRelation);

      await expect(addUserPermission(existingRelation)).rejects.toThrow(
        TransactionCanceledException
      );
    }
  );
});
