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

describe("Integration:: enter landing page url", () => {
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
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            existingService.serviceId
          )
        )
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

      vi.restoreAllMocks();
      vi.resetModules();
      app = undefined;
    }
  );

  integrationTest("should return enter landing page url page", async () => {
    const res = await requestAgent.get(
      getServicePaths(
        PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
        existingService.serviceId
      )
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          "landing-page-url": "http://url.com",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when landing page url is not a URL",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "landing-page-url": "not-a-url",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("landing-page-url-error")).text()).toContain(
        "Your landing page URL must be a valid URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /levels-of-confidence with a valid url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "landing-page-url": "http://url.com",
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /levels-of-confidence with an empty url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
