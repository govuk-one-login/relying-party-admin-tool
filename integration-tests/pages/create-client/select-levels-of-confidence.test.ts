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

describe("Integration:: select levels of confidence", () => {
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

  integrationTest(
    "should return select levels of confidence page",
    async () => {
      const res = await requestAgent.get(
        getServicePaths(
          PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
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
            PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
            serviceId
          )
        )
        .type("form")
        .send({
          "selected-loc": ["P2"],
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  describe("identity verification is supported", () => {
    let identityVerificationSupportedApp: any;
    let identityVerificationSupportedRequestAgent: any;
    let identityVerificationSupportedToken: string | string[] | undefined;

    integrationTest.beforeAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();

      const noCacheMiddleware =
        await import("../../../src/middleware/no-cache-middleware.js");
      vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
        async (req: any, res: any, next: any): Promise<void> => {
          req.session.newClientConfig = {
            isIdentityVerificationSupported: true,
          };
          return next();
        }
      );

      identityVerificationSupportedApp = await (
        await import("../../../src/app.js")
      ).createApp();

      identityVerificationSupportedRequestAgent = request.agent(
        identityVerificationSupportedApp
      );

      await identityVerificationSupportedRequestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          identityVerificationSupportedToken = $("[name=_csrf]").val();
        });
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      identityVerificationSupportedApp = undefined;
    });

    integrationTest(
      "should fail validation with empty level-of-confidence",
      async () => {
        const res = await identityVerificationSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationSupportedToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("selected-locs-error")).text()).toContain(
          "You must select one level of confidence"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should redirect to /summary with valid level-of-confidence",
      async () => {
        const res = await identityVerificationSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationSupportedToken,
            "selected-locs": "P2",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("identity verification is not supported", () => {
    let identityVerificationNotSupportedApp: any;
    let identityVerificationNotSupportedRequestAgent: any;
    let identityVerificationNotSupportedToken: string | string[] | undefined;

    integrationTest.beforeAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();

      const noCacheMiddleware =
        await import("../../../src/middleware/no-cache-middleware.js");
      vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
        async (req: any, res: any, next: any): Promise<void> => {
          req.session.newClientConfig = {
            isIdentityVerificationSupported: "true",
          };
          return next();
        }
      );

      identityVerificationNotSupportedApp = await (
        await import("../../../src/app.js")
      ).createApp();

      identityVerificationNotSupportedRequestAgent = request.agent(
        identityVerificationNotSupportedApp
      );

      await identityVerificationNotSupportedRequestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          identityVerificationNotSupportedToken = $("[name=_csrf]").val();
        });
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      identityVerificationNotSupportedApp = undefined;
    });

    integrationTest(
      "should fail validation with P1 level of confidence",
      async () => {
        const res = await identityVerificationNotSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationNotSupportedToken,
            "selected-locs": "P1",
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("selected-locs-error")).text()).toContain(
          "Identity verification must be supported"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should redirect to /summary with P0 level of confidence",
      async () => {
        const res = await identityVerificationNotSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationNotSupportedToken,
            "selected-locs": "P0",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });
});
