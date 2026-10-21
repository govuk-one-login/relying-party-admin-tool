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

describe("Integration:: edit is active", () => {
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
        .get(getServicePaths(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, serviceId))
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

  integrationTest("should return edit is active page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, serviceId))
        .type("form")
        .send({
          "is-active": "true",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when is active is empty",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, serviceId))
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("is-active-error")).text()).toContain(
        "Select an option"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients when valid is active option",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, serviceId))
        .type("form")
        .send({
          _csrf: token,
          "is-active": "true",
        })
        .expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );
});
