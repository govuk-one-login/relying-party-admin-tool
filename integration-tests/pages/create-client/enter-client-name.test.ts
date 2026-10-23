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

describe("Integration:: enter client name", () => {
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
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
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

  integrationTest("should return enter client name page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          name: "Test Client",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest("should fail validation when name is empty", async () => {
    const res = await requestAgent
      .post(
        getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
      )
      .type("form")
      .send({
        _csrf: token,
        name: "",
      });
    const $ = cheerio.load(res.text);
    expect($(testComponent("name-error")).text()).toContain(
      "Enter your client name"
    );
    expect(res.statusCode).toBe(400);
  });

  integrationTest(
    "should fail validation when name exceeds 255 characters",
    async () => {
      const longName = "a".repeat(256);
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          name: longName,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("name-error")).text()).toContain(
        "Your client name must be less than 255 characters long"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when name has non-ascii characters",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          name: "🆕 client",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("name-error")).text()).toContain(
        "Your client name must only use ASCII characters"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when name begins with a colon",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          name: ":my client",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("name-error")).text()).toContain(
        "Your client name cannot start with ':'"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /select-client-authentication-method when client name is valid",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          name: "my client",
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION,
            serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
