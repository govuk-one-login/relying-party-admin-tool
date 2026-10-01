import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest, setupAllTables } from "../../base.js";
import { getServicePaths } from "../../helpers/urls.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";

setupAllTables();

describe("Integration:: edit jar validation required", () => {
  integrationTest.beforeEach(
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
    }) => {
      const existingUser: User = {
        id: "userId",
        name: "Test User",
        email: "test@user.com",
      };
      await addUserToDynamo(existingUser);
      const serviceId = "1";
      const existingRelation: Relation = {
        userId: "userId",
        object: `service:${serviceId}`,
        relation: UserPermission.WRITER_INT,
      };
      await addUserRelationToDynamo(existingRelation);

      const existingService: Service = {
        serviceId: serviceId,
        name: "Test service",
      };
      await addServiceToDynamo(existingService);
    }
  );

  integrationTest(
    "should return edit jar validation required page",
    async ({ request }) => {
      const res = await request.get(
        getServicePaths(PATH_NAMES.CLIENT_EDIT_JAR_VALIDATION_REQUIRED)
      );
      expect(res.statusCode).toBe(200);
    }
  );
});
