import { randomBytes, randomUUID } from "crypto";
import { PATH_NAMES } from "../../src/app.constants.js";
import { UserPermission } from "../../src/models/permissions.js";
import { Relation } from "../../src/models/relation.js";
import { Service } from "../../src/models/service.js";
import { User } from "../../src/models/user.js";
import { integrationTest } from "../base.js";
import { createTestClient, getServicePaths } from "../helpers/helpers.js";
import { Application } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent.js";
import { ClientServiceSummary } from "../../src/models/client.js";
import { addClientToService } from "../../src/datastores/services-data-store.js";

describe("Integration:: edit client router tests", () => {
  let app: Application;
  let requestAgent: TestAgent;

  const editClientRoutes = Object.entries(PATH_NAMES)
    .filter(([_, v]) =>
      v.includes("/services/:serviceId/clients/:clientId/edit")
    )
    .map(([_, v]) => v);

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
  const existingClient: ClientServiceSummary = createTestClient(
    serviceId,
    clientId
  );

  integrationTest.beforeAll(
    async ({
      addUserToDynamo,
      addUserRelationToDynamo,
      addServiceToDynamo,
    }) => {
      await addUserToDynamo(existingUser);
      await addUserRelationToDynamo(existingRelation);
      await addServiceToDynamo(existingService);
      await addClientToService(existingClient);

      app = await (await import("../../src/app.js")).createApp();
      requestAgent = request.agent(app);
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

  integrationTest.each(editClientRoutes)(
    "it renders a 403 for a non-existent service ID on route: %s",
    async (route) => {
      const res = await requestAgent.get(
        getServicePaths(route, randomBytes(32).toString("base64url"))
      );
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest.each(editClientRoutes)(
    "it renders a 403 for a non-existent client ID on route: %s",
    async (route) => {
      const res = await requestAgent.get(
        getServicePaths(route, serviceId, randomBytes(32).toString("base64url"))
      );
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );
});
