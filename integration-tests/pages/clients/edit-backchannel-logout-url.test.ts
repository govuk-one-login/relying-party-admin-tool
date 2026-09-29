import { load } from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest, setupAllTables } from "../../base.js";
import { getServicePaths } from "../../helpers/urls.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { createApp } from "../../../src/app.js";
import { Service } from "../../../src/models/service.js";

setupAllTables();

describe("Integration:: edit backchannel logout url", () => {
  let token: string | string[] | undefined;
  let cookies: string;
  let app: any;

  integrationTest(
    "should return edit backchannel logout url page",
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
      request,
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

      const res = await request.get(
        getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL)
      );
      if (res.statusCode !== 200) {
        console.error("Express Error Body:", res.text);
      }
      expect(res.statusCode).toBe(200);
    }
  );
});
