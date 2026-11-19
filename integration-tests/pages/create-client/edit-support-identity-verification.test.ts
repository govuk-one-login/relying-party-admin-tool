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

describe("Integration:: support identity verification", () => {
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
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
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
      await deleteUserFromDynamo(existingUser);
      await deleteUserRelationFromDynamo(existingRelation);
      await deleteServiceFromDynamo(existingService);

      vi.restoreAllMocks();
      vi.resetModules();
      app = undefined;
    }
  );

  integrationTest(
    "should return is identity verification supported page",
    async () => {
      const res = await requestAgent.get(
        getServicePaths(
          PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
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
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .type("form")
        .send({
          "support-identity-verification": "true",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when support identity verification is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("support-identity-verification-error")).text()
      ).toContain("Choose an option to support identity verification or not");
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /select-claims when support identity verification is true",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "support-identity-verification": "true",
        })
        .expect(
          "Location",
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /summary when support identity verification is false",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "support-identity-verification": "false",
        })
        .expect(
          "Location",
          getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
        );
      expect(res.statusCode).toBe(302);
    }
  );

  describe("client secret is set", () => {
    let clientSecretApp: any;
    let clientSecretRequestAgent: any;
    let clientSecretToken: string | string[] | undefined;

    integrationTest.beforeAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();

      const noCacheMiddleware =
        await import("../../../src/middleware/no-cache-middleware.js");
      vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
        async (req: any, res: any, next: any): Promise<void> => {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "CLIENT_SECRET",
          };
          return next();
        }
      );

      clientSecretApp = await (await import("../../../src/app.js")).createApp();

      clientSecretRequestAgent = request.agent(clientSecretApp);

      await clientSecretRequestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          clientSecretToken = $("[name=_csrf]").val();
        });
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      clientSecretApp = undefined;
    });

    integrationTest(
      "should return validation error when support identity verification is true and client secret is set",
      async () => {
        const res = await clientSecretRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: clientSecretToken,
            "support-identity-verification": "true",
          });
        const $ = cheerio.load(res.text);
        expect(
          $(testComponent("support-identity-verification-error")).text()
        ).toContain(
          "Identity verification cannot be supported if client secret is used as authentication method"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should redirect to /summary when support identity verification is false and client secret is set",
      async () => {
        const res = await clientSecretRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: clientSecretToken,
            "support-identity-verification": "false",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("support identity verification is false", () => {
    let supportIdentityVerificationApp: any;
    let supportIdentityVerificationRequestAgent: any;
    let supportIdentityVerificationToken: string | string[] | undefined;

    integrationTest.beforeAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();

      const noCacheMiddleware =
        await import("../../../src/middleware/no-cache-middleware.js");
      vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
        async (req: any, res: any, next: any): Promise<void> => {
          req.session.newClientConfig = {
            isIdentityVerificationSupported: false,
          };
          return next();
        }
      );

      supportIdentityVerificationApp = await (
        await import("../../../src/app.js")
      ).createApp();

      supportIdentityVerificationRequestAgent = request.agent(
        supportIdentityVerificationApp
      );

      await supportIdentityVerificationRequestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          supportIdentityVerificationToken = $("[name=_csrf]").val();
        });
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      supportIdentityVerificationApp = undefined;
    });

    integrationTest(
      "should redirect to /select-claims when support identity verification changes to true",
      async () => {
        const res = await supportIdentityVerificationRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: supportIdentityVerificationToken,
            "support-identity-verification": "true",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );

    integrationTest(
      "should redirect to /summary when support identity verification does not change",
      async () => {
        const res = await supportIdentityVerificationRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: supportIdentityVerificationToken,
            "support-identity-verification": "false",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("support identity verification is true", () => {
    let supportIdentityVerificationApp: any;
    let supportIdentityVerificationRequestAgent: any;
    let supportIdentityVerificationToken: string | string[] | undefined;

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

      supportIdentityVerificationApp = await (
        await import("../../../src/app.js")
      ).createApp();

      supportIdentityVerificationRequestAgent = request.agent(
        supportIdentityVerificationApp
      );

      await supportIdentityVerificationRequestAgent
        .get(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
            serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          supportIdentityVerificationToken = $("[name=_csrf]").val();
        });
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      supportIdentityVerificationApp = undefined;
    });

    integrationTest(
      "should redirect to /summary when support identity verification changes to false",
      async () => {
        const res = await supportIdentityVerificationRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: supportIdentityVerificationToken,
            "support-identity-verification": "false",
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );

    integrationTest(
      "should redirect to /summary when support identity verification does not change",
      async () => {
        const res = await supportIdentityVerificationRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_EDIT_IDENTITY_VERIFICATION_SUPPORT,
              serviceId
            )
          )
          .type("form")
          .send({
            _csrf: supportIdentityVerificationToken,
            "support-identity-verification": "true",
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
