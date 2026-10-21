import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { randomUUID } from "crypto";
import {
  setUpTestWithExistingUserAndService,
  teardownTestWithExistingUserAndService,
} from "../../helpers/test-setup.js";

describe("Integration:: edit service type", () => {
  let token: string | string[] | undefined;
  let app: any;
  let requestAgent: any;
  const existingUserId = randomUUID();
  const serviceId = randomUUID();

  integrationTest.beforeAll(
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
    }) => {
      await setUpTestWithExistingUserAndService(
        addUserToDynamo,
        addUserRelationToDynamo,
        addServiceToDynamo,
        existingUserId,
        serviceId
      );

      app = await (await import("../../../src/app.js")).createApp();

      requestAgent = request.agent(app);

      await requestAgent
        .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId))
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
      await teardownTestWithExistingUserAndService(
        deleteUserFromDynamo,
        deleteUserRelationFromDynamo,
        deleteServiceFromDynamo,
        existingUserId,
        serviceId
      );

      vi.restoreAllMocks();
      vi.resetModules();
      app = undefined;
    }
  );

  integrationTest("should return edit service type page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId))
        .type("form")
        .send({
          "service-type": "MANDATORY",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when service type is empty",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId))
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("service-type-error")).text()).toContain(
        "Service type is required"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should return validation error when service type is an invalid service type",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId))
        .type("form")
        .send({
          _csrf: token,
          "service-type": "invalid-service-type",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("service-type-error")).text()).toContain(
        'Invalid service type provided: "invalid-service-type"'
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients when valid service type",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, serviceId))
        .type("form")
        .send({
          _csrf: token,
          "service-type": "MANDATORY",
        })
        .expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );
});
