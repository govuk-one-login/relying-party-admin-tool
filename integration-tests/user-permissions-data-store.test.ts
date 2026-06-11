import { integrationTest } from "./base.js";
import { User } from "../src/models/user.js";
import { getUser } from "../src/datastores/user-permissions-data-store.js";

describe("user permissions data store tests", () => {
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
});
