import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";
import { randomUUID } from "crypto";

describe("Integration:: edit sector identifier uri", () => {
  let token: string | string[] | undefined;
  let app: any;
  let requestAgent: any;
  const existingUserId = randomUUID();
  const existingUser: User = {
    id: existingUserId,
    name: "Test User",
    email: "test@user.com",
  };
  const serviceId = randomUUID();
  const existingRelation: Relation = {
    userId: existingUserId,
    object: `service:${serviceId}`,
    relation: UserPermission.WRITER_INT,
  };
  const existingService: Service = {
    serviceId: serviceId,
    name: "Test service",
  };

  integrationTest.beforeAll(
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
    }) => {
      await addUserToDynamo(existingUser);
      await addUserRelationToDynamo(existingRelation);
      await addServiceToDynamo(existingService);

      app = await (await import("../../../src/app.js")).createApp();

      requestAgent = request.agent(app);

      await requestAgent
        .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI))
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          token = $("[name=_csrf]").val();
        });
    }
  );

  integrationTest.afterAll(
    async ({
      deleteUserFromDynamo,
      deleteUserRelationFromDynamo,
      deleteServiceFromDynamo,
    }) => {
      await deleteUserFromDynamo(existingUser);
      await deleteUserRelationFromDynamo(existingRelation);
      await deleteServiceFromDynamo(existingService);
    }
  );

  integrationTest("should return edit sector identifier uri page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI))
        .type("form")
        .send({
          "sector-identifier-uri": "test-url.com",
        });
      expect(res.header.location).toBe("/forbidden");
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should return validation error when uri is not a valid uri",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI))
        .type("form")
        .send({
          _csrf: token,
          "sector-identifier-uri": "not-a-uri",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("sector-identifier-uri-error")).text()).toContain(
        "Your sector identifier URI must be a valid URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should return validation error when uri is empty",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI))
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("sector-identifier-uri-error")).text()).toContain(
        "Enter a sector identifier URI"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients when valid sector identifier uri",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI))
        .type("form")
        .send({
          _csrf: token,
          "sector-identifier-uri": "http://url.com",
        })
        .expect("Location", getServicePaths(PATH_NAMES.CLIENT));
      expect(res.statusCode).toBe(302);
    }
  );
});
