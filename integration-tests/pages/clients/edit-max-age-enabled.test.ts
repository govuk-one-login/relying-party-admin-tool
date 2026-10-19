import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import {
  createTestClient,
  getServicePaths,
  testComponent,
} from "../../helpers/helpers.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";
import { randomUUID } from "crypto";

describe("Integration:: edit max age enabled", () => {
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
  const clientId = randomUUID();
  const existingRelation: Relation = {
    userId: existingUserId,
    object: `service:${serviceId}`,
    relation: UserPermission.WRITER_INT,
  };
  const existingService: Service = {
    serviceId: serviceId,
    name: "Test service",
  };
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
            PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
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

  integrationTest("should return edit max age enabled page", async () => {
    const res = await requestAgent.get(
      getServicePaths(
        PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
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
            PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          "max-age-enabled": "true",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when max age enabled is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("max-age-enabled-error")).text()).toContain(
        "Select an option"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients when valid max age enabled option",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
            existingService.serviceId,
            existingClient.clientId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "max-age-enabled": "true",
        })
        .expect(
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
