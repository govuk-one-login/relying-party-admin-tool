import request from "supertest";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import {
  createTestRelation,
  createTestService,
  createTestUser,
  getServicePaths,
} from "../../helpers/helpers.js";
import { randomUUID } from "crypto";

describe("Integration:: create client success", () => {
  let app: any;
  let requestAgent: any;
  const existingUserId = randomUUID();
  const serviceId = randomUUID();
  const clientId = randomUUID();

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
    }
  );

  integrationTest.beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

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

  integrationTest("should return create client success page", async () => {
    const noCacheMiddleware =
      await import("../../../src/middleware/no-cache-middleware.js");
    vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
      async (req: any, res: any, next: any): Promise<void> => {
        req.session.newClientConfig = {
          clientId,
        };
        return next();
      }
    );

    app = await (await import("../../../src/app.js")).createApp();

    requestAgent = request.agent(app);

    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_SUCCESS, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to 500 when clientId is not present",
    async () => {
      app = await (await import("../../../src/app.js")).createApp();

      requestAgent = request.agent(app);

      const res = await requestAgent
        .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUCCESS, serviceId))
        .expect("Location", getServicePaths(PATH_NAMES.SERVICE, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );
});
