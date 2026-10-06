import { integrationTest } from "./base.js";
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
import { randomUUID } from "crypto";

describe("user permissions data store tests", () => {
  const userId = randomUUID();
  const testUser: User = {
    id: userId,
    name: "Test User",
    email: "test@user.com",
  };

  describe("getUser", () => {
    integrationTest.beforeAll(async ({ addUserToDynamo }) => {
      await addUserToDynamo(testUser);
    });

    integrationTest.afterAll(async ({ deleteUserFromDynamo }) => {
      await deleteUserFromDynamo(testUser);
    });

    integrationTest(
      "should get user from table by ID if user exists",
      async () => {
        const user = await getUser(userId);

        expect(user).toStrictEqual(testUser);
      }
    );

    integrationTest(
      "should not get user if user with ID does not exist",
      async () => {
        const user = await getUser("not-a-user-id");

        expect(user).toBeUndefined();
      }
    );
  });

  describe("getServicesWithRelationForUser", () => {
    const relationServiceId1 = randomUUID();
    const existingRelation1: Relation = {
      userId,
      object: `service:${relationServiceId1}`,
      relation: UserPermission.READER,
    };
    const relationServiceId2 = randomUUID();
    const existingRelation2: Relation = {
      userId,
      object: `service:${relationServiceId2}`,
      relation: UserPermission.READER,
    };

    integrationTest.beforeAll(async ({ addUserRelationToDynamo }) => {
      await addUserRelationToDynamo(existingRelation1);
      await addUserRelationToDynamo(existingRelation2);
    });

    integrationTest.afterAll(async ({ deleteUserRelationFromDynamo }) => {
      await deleteUserRelationFromDynamo(existingRelation1);
      await deleteUserRelationFromDynamo(existingRelation2);
    });

    integrationTest(
      "should get services with relation from table by ID if user exists",
      async () => {
        const services = await getServicesWithRelationForUser(
          userId,
          UserPermission.READER
        );

        expect(services).toContainEqual(relationServiceId1);
        expect(services).toContainEqual(relationServiceId2);
      }
    );

    integrationTest(
      "should not return services with relation from table by ID if user does not exists",
      async () => {
        const services = await getServicesWithRelationForUser(
          "user-that-does-not-exist",
          UserPermission.READER
        );

        expect(services).toStrictEqual([]);
      }
    );
  });

  describe("createUser", () => {
    integrationTest.afterEach(async ({ deleteUserFromDynamo }) => {
      await deleteUserFromDynamo(testUser);
    });

    integrationTest(
      "should create user if user does not exist",
      async ({ getUserFromDynamo }) => {
        await createUser(testUser);

        const actualUser = await getUserFromDynamo(userId);

        expect(testUser).toStrictEqual(actualUser);
      }
    );

    integrationTest(
      "should fail to create user if user already exists with id",
      async ({ addUserToDynamo }) => {
        await addUserToDynamo(testUser);

        await expect(createUser(testUser)).rejects.toThrow(
          ConditionalCheckFailedException
        );
      }
    );
  });

  describe("addUserPermission", () => {
    const relation: Relation = {
      userId,
      object: `service:${randomUUID()}`,
      relation: UserPermission.READER,
    };
    const existingRelation: Relation = {
      userId,
      object: `service:${randomUUID()}`,
      relation: UserPermission.WRITER_INT,
    };

    integrationTest.beforeAll(
      async ({ addUserToDynamo, addUserRelationToDynamo }) => {
        await addUserToDynamo(testUser);
        await addUserRelationToDynamo(existingRelation);
      }
    );

    integrationTest.afterAll(
      async ({ deleteUserFromDynamo, deleteUserRelationFromDynamo }) => {
        await deleteUserFromDynamo(testUser);
        await deleteUserRelationFromDynamo(relation);
        await deleteUserRelationFromDynamo(existingRelation);
      }
    );

    integrationTest(
      "should add user permission if user exists",
      async ({ userPermissionExistsInDynamo }) => {
        await addUserPermission(relation);

        await expect(userPermissionExistsInDynamo(relation)).resolves.toBe(
          true
        );
      }
    );

    integrationTest(
      "should fail to add user permission if user does not exist",
      async () => {
        const relation: Relation = {
          userId: "user-that-does-not-exist",
          object: `service:${randomUUID()}`,
          relation: UserPermission.READER,
        };

        await expect(addUserPermission(relation)).rejects.toThrow(
          TransactionCanceledException
        );
      }
    );

    integrationTest(
      "should fail to add user permission if permission already exists",
      async () => {
        await expect(addUserPermission(existingRelation)).rejects.toThrow(
          TransactionCanceledException
        );
      }
    );
  });
});
