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

describe("Integration:: edit post logout redirect urls", () => {
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
        .get(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
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

  integrationTest(
    "should return edit post logout redirect urls page",
    async () => {
      const res = await requestAgent.get(
        getServicePaths(
          PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
          serviceId
        )
      );
      expect(res.statusCode).toBe(200);
    }
  );

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          "post-logout-redirect-urls": ["test-url.com"],
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when redirect url input is not a valid url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "post-logout-redirect-url-input": "not-a-url",
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("post-logout-redirect-urls-error")).text()
      ).toContain("Your post logout redirect URL must be a valid URL");
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should return validation error when redirect url input is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
        });
      const $ = cheerio.load(res.text);
      expect(res.statusCode).toBe(400);
      expect(
        $(testComponent("post-logout-redirect-urls-error")).text()
      ).toContain("Enter a post logout redirect URL");
    }
  );

  integrationTest(
    "should return validation error when redirect url input already exists in the table",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "post-logout-redirect-url-input": "http://url.com",
          "post-logout-redirect-urls": ["http://url.com"],
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("post-logout-redirect-urls-error")).text()
      ).toContain("You have already added this redirect URL");
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should pass validation and stay on the post logout redirect urls page with valid redirect url input",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "post-logout-redirect-url-input": "http://url.com",
        });
      expect(res.req.path).toBe(
        getServicePaths(
          PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
          serviceId
        )
      );
    }
  );

  integrationTest(
    "should redirect to /clients with one valid redirect url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "continue",
          "post-logout-redirect-urls": "http://url.com",
        });
      expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /clients with multiple valid redirect urls",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "continue",
          "post-logout-redirect-urls": ["http://url.com", "http://url2.com"],
        });
      expect(res.statusCode).toBe(302);
      expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /clients without any redirect urls",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "continue",
        });
      expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );
});
