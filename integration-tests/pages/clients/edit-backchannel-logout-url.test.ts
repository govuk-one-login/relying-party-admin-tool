import request from "supertest";
import { load } from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest, setupAllTables } from "../../base.js";
import { getServicePaths } from "../../helpers/urls.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";

describe("Integration:: edit backchannel logout url", () => {
  let token: string | string[] | undefined;
  let cookies: string;
  let app: any;

  integrationTest.beforeAll(async () => {
    vi.resetModules();
    setupAllTables();

    app = await (await import("../../../src/app.js")).createApp();
  });

  integrationTest.beforeEach(async () => {
    vi.clearAllMocks();
    await request(app)
      .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL))
      .then((res) => {
        const $ = load(res.text);
        cookies = res.headers["set-cookie"];
        token = $("[name=_csrf]").val();
      });
  });

  integrationTest.afterAll(() => {
    vi.restoreAllMocks();
    app = undefined;
  });

  integrationTest(
    "should return edit backchannel logout url page",
    async ({ addUserToDynamo, addUserRelationToDynamo }) => {
      const existingUser: User = {
        id: "userId",
        name: "Test User",
        email: "test@user.com",
      };
      await addUserToDynamo(existingUser);
      const relationServiceId = "1";
      const existingRelation: Relation = {
        userId: "userId",
        object: `service:${relationServiceId}`,
        relation: UserPermission.WRITER_INT,
      };
      await addUserRelationToDynamo(existingRelation);

      const res = await request(app)
        .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL))
        .expect(200);
      expect(res.statusCode).toBe(200);
    }
  );
});
