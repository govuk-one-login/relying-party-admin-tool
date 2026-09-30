import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest, setupAllTables } from "../../base.js";
import { getServicePaths } from "../../helpers/urls.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";
import { checkFailedCSRFValidationBehaviour } from "../../utils/behaviours.js";

setupAllTables();

describe("Integration:: edit backchannel logout url", () => {
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
    "should return edit backchannel logout url page",
    async ({ request }) => {
      const res = await request.get(
        getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL)
      );
      expect(res.statusCode).toBe(200);
    }
  );

  integrationTest(
    "should redirect to Your services when csrf not present",
    async ({ request }) => {
      const res = await request
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL))
        .type("form")
        .send({
          "backchannel-logout-url": "test-url.com",
        })
        .expect(302);
      if (res.statusCode !== 200) {
        console.error("Express Error Body:", res.text);
      }
      expect(res.header.location).toBe("/services");
    }
  );
});
