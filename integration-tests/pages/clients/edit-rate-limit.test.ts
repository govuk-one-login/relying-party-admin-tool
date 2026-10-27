import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import {
  createTestClient,
  createTestRelation,
  createTestService,
  createTestUser,
  getServicePaths,
  testComponent,
} from "../../helpers/helpers.js";
import { randomUUID } from "crypto";

describe("Integration:: edit rate limit", () => {
  let token: string | string[] | undefined;
  let app: any;
  let requestAgent: any;
  const existingUserId = randomUUID();
  const serviceId = randomUUID();
  const clientId = randomUUID();

  const existingService = createTestService(serviceId);
  const existingUser = createTestUser(existingUserId);
  const existingRelation = createTestRelation(serviceId, existingUserId);
  const existingClient = createTestClient(serviceId, clientId);

  integrationTest.beforeAll(
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
      addClientsToDynamo,
    }) => {
      await addUserToDynamo(existingUser);
      await addUserRelationToDynamo(existingRelation);
      await addServiceToDynamo(existingService);
      await addClientsToDynamo([existingClient]);

      app = await (await import("../../../src/app.js")).createApp();

      requestAgent = request.agent(app);

      await requestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
            existingService.serviceId,
            existingClient.clientId
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
      deleteClientsFromDynamo,
    }) => {
      await deleteUserFromDynamo(existingUser);
      await deleteUserRelationFromDynamo(existingRelation);
      await deleteServiceFromDynamo(existingService);
      await deleteClientsFromDynamo([existingClient]);
    }
  );

  integrationTest("should return edit rate limit page", async () => {
    const res = await requestAgent.get(
      getServicePaths(
        PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
        existingService.serviceId,
        existingClient.clientId
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
            PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          "rate-limit": "http://url.com",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when rate limit is negative",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "rate-limit": "-1",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("rate-limit-error")).text()).toContain(
        "Rate limit must be a positive number"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should return validation error when rate limit is above the max limit",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "rate-limit": "51",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("rate-limit-error")).text()).toContain(
        "Rate limit must be below the max limit of 50"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients with valid rate limit",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "rate-limit": "1",
        });
      expect(
        "Location",
        getServicePaths(
          PATH_NAMES.CLIENT,
          existingService.serviceId,
          existingClient.clientId
        )
      );
      expect(res.statusCode).toBe(302);
    }
  );
});
