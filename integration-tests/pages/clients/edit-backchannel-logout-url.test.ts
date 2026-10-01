import request from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";

describe("Integration:: edit backchannel logout url", () => {
  let token: string | string[] | undefined;
  let cookies: string;
  let app: any;

  integrationTest.beforeAll(
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
    "should return validation error when url is not a valid url",
    async () => {
      app = await (await import("../../../src/app.js")).createApp();
      await request(app)
        .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL))
        .then((res) => {
          const $ = cheerio.load(res.text);
          token = $("[name=_csrf]").val();
          cookies = res.headers["set-cookie"];
        });
      console.log(token);
      //console.log("HERE");
      const res = await request(app)
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL))
        .type("form")
        .send({
          _csrf: token,
          "backchannel-logout-url": "not-a-url",
        });
      //console.log(res);
      const $ = cheerio.load(res.text);
      //console.log($("[id='backchannel-logout-url-error']").contents());
      expect($(testComponent("backchannel-logout-url-error")).text()).toContain(
        "Your backchannel logout URL must be a valid URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );
});
