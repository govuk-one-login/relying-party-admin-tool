import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import {
  createTestRelation,
  createTestService,
  createTestUser,
  getServicePaths,
  testComponent,
} from "../../helpers/helpers.js";
import { randomUUID } from "crypto";

describe("Integration:: edit client name", () => {
  let token: string | string[] | undefined;
  let app: any;
  let requestAgent: any;
  const existingUserId = randomUUID();
  const serviceId = randomUUID();

  const existingService = createTestService(serviceId);
  const existingUser = createTestUser(existingUserId);
  const existingRelation = createTestRelation(serviceId, existingUserId);

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
          getServicePaths(PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_NAME, serviceId)
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

  integrationTest("should return edit client name page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_NAME, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          name: "Test Client",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when name begins with a colon",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "client-name": ":my client",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("client-name-error")).text()).toContain(
        "Your client name cannot start with ':'"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /summary when client name is valid",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_NAME, serviceId)
        )
        .type("form")
        .send({
          _csrf: token,
          "client-name": "my client",
        })
        .expect(
          "Location",
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
