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

describe("Integration:: enter redirect urls", () => {
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
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
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

  integrationTest("should return enter redirect urls page", async () => {
    const res = await requestAgent.get(
      getServicePaths(
        PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
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
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          "redirect-urls": ["http://url.com"],
          action: "continue",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when redirect url input is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "Enter a redirect URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when redirect url input is empty string",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": " ",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "Enter a redirect URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when redirect url input is not a URL",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": "not-a-url",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "Your redirect URL must be a valid URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when redirect url already exists in the table",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": "http://url.com",
          "redirect-urls": ["http://url.com"],
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "You have already added this redirect URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when redirect url contains an invalid query parameter",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": "http://url.com?response",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "You have entered a redirect URL with an invalid query parameter name"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when redirect url contains an invalid scheme",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": "javascript://url.com",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("redirect-urls-error")).text()).toContain(
        "You have entered a redirect URL with an invalid scheme"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest("should fail validation when table is empty", async () => {
    const res = await requestAgent
      .post(
        getServicePaths(
          PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
          existingService.serviceId
        )
      )
      .type("form")
      .send({
        _csrf: token,
        action: "continue",
      });
    const $ = cheerio.load(res.text);
    expect($(testComponent("redirect-urls-error")).text()).toContain(
      "You must have at least one redirect URL"
    );
    expect(res.statusCode).toBe(400);
  });

  integrationTest(
    "should pass validation and stay on the redirect urls page with valid redirect url input",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "add",
          "redirect-url-input": "http://url.com",
        });
      expect(res.req.path).toBe(
        getServicePaths(
          PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
          existingService.serviceId
        )
      );
    }
  );

  integrationTest(
    "should redirect to /select-scopes with one valid redirect url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "continue",
          "redirect-urls": "http://url.com",
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /select-scopes with multiple valid redirect urls",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          action: "continue",
          "redirect-urls": ["http://url.com", "http://url2.com"],
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
