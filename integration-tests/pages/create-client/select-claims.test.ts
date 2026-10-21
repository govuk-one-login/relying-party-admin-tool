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

describe("Integration:: select claims", () => {
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
        .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId))
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

  integrationTest("should return select claims page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
        )
        .type("form")
        .send({
          "selected-claims": ["https://vocab.account.gov.uk/v1/passport"],
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when invalid claim added",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "selected-claims": ["not-a-claim"],
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("selected-claims-error")).text()).toContain(
        'Invalid claim provided: "not-a-claim"'
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /enter-landing-page-url with valid claims",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "selected-claims": [
            "https://vocab.account.gov.uk/v1/coreIdentityJWT",
          ],
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /enter-landing-page-url with empty claims",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
