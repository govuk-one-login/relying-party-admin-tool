import { integrationTest, setupUserPermissionsTable } from "./base.js";
import { User } from "../src/models/user.js";
import {
  getServicesWithRelationForUser,
  getUser,
} from "../src/datastores/user-permissions-data-store.js";
import { Relation } from "../src/models/relation.js";
import { UserPermission } from "../src/models/permissions.js";

describe("user permissions data store tests", () => {
  setupUserPermissionsTable();
  integrationTest(
    "should get user from table by ID if user exists",
    async ({ addUsersToDynamo }) => {
      const existingUser: User = {
        id: "test-user-id",
        name: "Test User",
        email: "test@user.com",
      };
      await addUsersToDynamo(existingUser);

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
    async ({ addUserRelationsToDynamo }) => {
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
      await addUserRelationsToDynamo(existingRelation1);
      await addUserRelationsToDynamo(existingRelation2);

      const relation = await getServicesWithRelationForUser(
        "test-user-id",
        UserPermission.READER
      );

      expect(relation).toStrictEqual([relationServiceId1, relationServiceId2]);
    }
  );
});
