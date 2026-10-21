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

describe("Integration:: select scopes", () => {
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
        .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId))
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

  integrationTest("should return select scopes page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId)
        )
        .type("form")
        .send({
          "selected-scopes": ["email"],
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest("should fail validation with an invalid scope", async () => {
    const res = await requestAgent
      .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId))
      .type("form")
      .send({
        _csrf: token,
        "selected-scopes": "invalid-scope",
      });
    const $ = cheerio.load(res.text);
    expect($(testComponent("selected-scopes-error")).text()).toContain(
      'Invalid scope provided: "invalid-scope"'
    );
    expect(res.statusCode).toBe(400);
  });

  integrationTest(
    "should redirect to /support-identity-verification with valid scope",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "selected-scopes": "email",
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /support-identity-verification with valid scopes",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "selected-scopes": ["email", "phone"],
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /support-identity-verification with empty scopes",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
