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
import {
  defaultBaseClientValues,
  defaultClientSecretClientValues,
  defaultIdentityVerificationNotSupportedClientValues,
  defaultIdentityVerificationSupportedClientValues,
  defaultJWKSClientValues,
} from "../../helpers/default-client-values.js";

describe("Integration:: create client summary", () => {
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
        .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
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

  integrationTest("should return create client summary page", async () => {
    const res = await requestAgent.get(
      getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId)
    );
    expect(res.statusCode).toBe(200);
  });

  integrationTest(
    "should redirect to forbidden when csrf not present",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
        .type("form")
        .send();
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when all client fields are empty",
    async () => {
      const res = await requestAgent
        .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect(res.statusCode).toBe(400);
      expect($(testComponent("error-summary")).text()).toContain(
        "Enter your client name"
      );
      expect($(testComponent("error-summary")).text()).toContain(
        "You must set a client authentication method"
      );
      expect($(testComponent("error-summary")).text()).toContain(
        "You must have at least one redirect URL"
      );
      expect($(testComponent("error-summary")).text()).toContain(
        'Scopes must contain "openid"'
      );
      expect($(testComponent("error-summary")).text()).toContain(
        "Choose an option to support identity verification or not"
      );
      expect($(testComponent("error-summary")).text()).toContain(
        "You must select one level of confidence"
      );
    }
  );

  describe("jwks url validation", () => {
    let jwksUrlApp: any;
    let jwksUrlRequestAgent: any;
    let jwksUrlToken: string | string[] | undefined;

    integrationTest.beforeEach(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      jwksUrlApp = undefined;
    });

    integrationTest(
      "should fail validation when client authentication method is JWKS and empty jwks endpoint",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "JWKS",
            };
            return next();
          }
        );

        jwksUrlApp = await (await import("../../../src/app.js")).createApp();

        jwksUrlRequestAgent = request.agent(jwksUrlApp);

        await jwksUrlRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            jwksUrlToken = $("[name=_csrf]").val();
          });

        const res = await jwksUrlRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: jwksUrlToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Enter a JWKS endpoint URL"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is not private_key_jwt",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "JWKS",
              jwksURL: "https://url.com",
              clientTokenAuthenticationMethod: "client_secret_post",
            };
            return next();
          }
        );

        jwksUrlApp = await (await import("../../../src/app.js")).createApp();

        jwksUrlRequestAgent = request.agent(jwksUrlApp);

        await jwksUrlRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            jwksUrlToken = $("[name=_csrf]").val();
          });

        const res = await jwksUrlRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: jwksUrlToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is empty",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "JWKS",
              jwksURL: "https://url.com",
            };
            return next();
          }
        );

        jwksUrlApp = await (await import("../../../src/app.js")).createApp();

        jwksUrlRequestAgent = request.agent(jwksUrlApp);

        await jwksUrlRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            jwksUrlToken = $("[name=_csrf]").val();
          });

        const res = await jwksUrlRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: jwksUrlToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should pass validation when client authentication method is JWKS and valid url",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              ...defaultBaseClientValues,
              ...defaultIdentityVerificationNotSupportedClientValues,
              clientAuthenticationMethod: "JWKS",
              jwksURL: "https://url.com",
              clientTokenAuthenticationMethod: "private_key_jwt",
            };
            return next();
          }
        );

        jwksUrlApp = await (await import("../../../src/app.js")).createApp();

        jwksUrlRequestAgent = request.agent(jwksUrlApp);

        await jwksUrlRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            jwksUrlToken = $("[name=_csrf]").val();
          });

        const res = await jwksUrlRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: jwksUrlToken,
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUCCESS, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("public key validation", () => {
    let publicKeyApp: any;
    let publicKeyRequestAgent: any;
    let publicKeyToken: string | string[] | undefined;

    integrationTest.beforeEach(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      publicKeyApp = undefined;
    });

    integrationTest(
      "should fail validation when client authentication method is STATIC and empty public key",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "STATIC",
            };
            return next();
          }
        );

        publicKeyApp = await (await import("../../../src/app.js")).createApp();

        publicKeyRequestAgent = request.agent(publicKeyApp);

        await publicKeyRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            publicKeyToken = $("[name=_csrf]").val();
          });

        const res = await publicKeyRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: publicKeyToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Enter a public key"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is not private_key_jwt",
      async () => {
        const validPublicKey =
          "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAluh9PbrQX91wl58R5QBG\n4SYgzR4ZlOL1Fj232nkLrLi/iLCWGLeL9Uil884zb3GcMY7wPhP5HbzXYSM9zxAr\nRdQ94s0mEi6v5Kuz07hF1UBMOCDrGRjSfFGQXx51ZXW8tqPTi6kR1U6F3CC7Qu1B\ny7cQDU6t6dBntEmSHK4mgbEnqL+6+tk/YLQtNZ3+E2HpOPaZIaRcVLpzATTrIqyI\nH5YhK2dQFhau04zPMAc/MLF8mQ1cMtYAbxopY91CsOVcmdni4cZYjquCP+Sx0dGK\nmBL3MQhqiWdmXyFlo1NKyHxn9/5zOP5lAi05dHgqjUC7AoF4nKedq0UbH2uxL72b\nrwIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "STATIC",
              publicKey: validPublicKey,
              clientTokenAuthenticationMethod: "client_secret_post",
            };
            return next();
          }
        );

        publicKeyApp = await (await import("../../../src/app.js")).createApp();

        publicKeyRequestAgent = request.agent(publicKeyApp);

        await publicKeyRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            publicKeyToken = $("[name=_csrf]").val();
          });

        const res = await publicKeyRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: publicKeyToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be private_key_jwt if client authentication method is a public key"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is empty",
      async () => {
        const validPublicKey =
          "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAluh9PbrQX91wl58R5QBG\n4SYgzR4ZlOL1Fj232nkLrLi/iLCWGLeL9Uil884zb3GcMY7wPhP5HbzXYSM9zxAr\nRdQ94s0mEi6v5Kuz07hF1UBMOCDrGRjSfFGQXx51ZXW8tqPTi6kR1U6F3CC7Qu1B\ny7cQDU6t6dBntEmSHK4mgbEnqL+6+tk/YLQtNZ3+E2HpOPaZIaRcVLpzATTrIqyI\nH5YhK2dQFhau04zPMAc/MLF8mQ1cMtYAbxopY91CsOVcmdni4cZYjquCP+Sx0dGK\nmBL3MQhqiWdmXyFlo1NKyHxn9/5zOP5lAi05dHgqjUC7AoF4nKedq0UbH2uxL72b\nrwIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "STATIC",
              publicKey: validPublicKey,
            };
            return next();
          }
        );

        publicKeyApp = await (await import("../../../src/app.js")).createApp();

        publicKeyRequestAgent = request.agent(publicKeyApp);

        await publicKeyRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            publicKeyToken = $("[name=_csrf]").val();
          });

        const res = await publicKeyRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: publicKeyToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be private_key_jwt if client authentication method is a public key"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should pass validation when client authentication method is STATIC and valid public key",
      async () => {
        const validPublicKey =
          "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAluh9PbrQX91wl58R5QBG\n4SYgzR4ZlOL1Fj232nkLrLi/iLCWGLeL9Uil884zb3GcMY7wPhP5HbzXYSM9zxAr\nRdQ94s0mEi6v5Kuz07hF1UBMOCDrGRjSfFGQXx51ZXW8tqPTi6kR1U6F3CC7Qu1B\ny7cQDU6t6dBntEmSHK4mgbEnqL+6+tk/YLQtNZ3+E2HpOPaZIaRcVLpzATTrIqyI\nH5YhK2dQFhau04zPMAc/MLF8mQ1cMtYAbxopY91CsOVcmdni4cZYjquCP+Sx0dGK\nmBL3MQhqiWdmXyFlo1NKyHxn9/5zOP5lAi05dHgqjUC7AoF4nKedq0UbH2uxL72b\nrwIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              ...defaultBaseClientValues,
              ...defaultIdentityVerificationNotSupportedClientValues,
              clientAuthenticationMethod: "STATIC",
              publicKey: validPublicKey,
              clientTokenAuthenticationMethod: "private_key_jwt",
            };
            return next();
          }
        );

        publicKeyApp = await (await import("../../../src/app.js")).createApp();

        publicKeyRequestAgent = request.agent(publicKeyApp);

        await publicKeyRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            publicKeyToken = $("[name=_csrf]").val();
          });

        const res = await publicKeyRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: publicKeyToken,
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUCCESS, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("client secret validation", () => {
    let clientSecretApp: any;
    let clientSecretRequestAgent: any;
    let clientSecretToken: string | string[] | undefined;

    integrationTest.beforeEach(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      clientSecretApp = undefined;
    });

    integrationTest(
      "should fail validation when client authentication method is CLIENT_SECRET and empty client secret",
      async () => {
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

        clientSecretApp = await (
          await import("../../../src/app.js")
        ).createApp();

        clientSecretRequestAgent = request.agent(clientSecretApp);

        await clientSecretRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            clientSecretToken = $("[name=_csrf]").val();
          });

        const res = await clientSecretRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: clientSecretToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Enter a client secret"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is not client_secret_post",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "CLIENT_SECRET",
              clientSecret: "client-secret", // pragma: allowlist secret
              clientTokenAuthenticationMethod: "private_key_jwt",
            };
            return next();
          }
        );

        clientSecretApp = await (
          await import("../../../src/app.js")
        ).createApp();

        clientSecretRequestAgent = request.agent(clientSecretApp);

        await clientSecretRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            clientSecretToken = $("[name=_csrf]").val();
          });

        const res = await clientSecretRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: clientSecretToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be client_secret_post if client authentication method is client secret"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client token authentication method is empty",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              clientAuthenticationMethod: "CLIENT_SECRET",
              clientSecret: "client-secret", // pragma: allowlist secret
            };
            return next();
          }
        );

        clientSecretApp = await (
          await import("../../../src/app.js")
        ).createApp();

        clientSecretRequestAgent = request.agent(clientSecretApp);

        await clientSecretRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            clientSecretToken = $("[name=_csrf]").val();
          });

        const res = await clientSecretRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: clientSecretToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Token authentication method must be client_secret_post if client authentication method is client secret"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should pass validation when client authentication method is CLIENT_SECRET and valid client secret",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              ...defaultBaseClientValues,
              ...defaultIdentityVerificationNotSupportedClientValues,
              clientAuthenticationMethod: "CLIENT_SECRET",
              clientSecret: "client-secret", // pragma: allowlist secret
              clientTokenAuthenticationMethod: "client_secret_post",
            };
            return next();
          }
        );

        clientSecretApp = await (
          await import("../../../src/app.js")
        ).createApp();

        clientSecretRequestAgent = request.agent(clientSecretApp);

        await clientSecretRequestAgent
          .get(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            clientSecretToken = $("[name=_csrf]").val();
          });

        const res = await clientSecretRequestAgent
          .post(getServicePaths(PATH_NAMES.CREATE_CLIENT_SUMMARY, serviceId))
          .type("form")
          .send({
            _csrf: clientSecretToken,
          })
          .expect(
            "Location",
            getServicePaths(PATH_NAMES.CREATE_CLIENT_SUCCESS, serviceId)
          );
        expect(res.statusCode).toBe(302);
      }
    );
  });

  describe("identity verification supported", () => {
    let identityVerificationSupportedApp: any;
    let identityVerificationSupportedRequestAgent: any;
    let identityVerificationSupportedToken: string | string[] | undefined;

    integrationTest.beforeEach(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
    });

    integrationTest.afterAll(async () => {
      vi.restoreAllMocks();
      vi.resetModules();
      identityVerificationSupportedApp = undefined;
    });

    integrationTest(
      "should fail validation when client authentication method is CLIENT_SECRET",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              ...defaultBaseClientValues,
              ...defaultIdentityVerificationSupportedClientValues,
              ...defaultClientSecretClientValues,
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
              PATH_NAMES.CREATE_CLIENT_SUMMARY,
              existingService.serviceId
            )
          )
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            identityVerificationSupportedToken = $("[name=_csrf]").val();
          });

        const res = await identityVerificationSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SUMMARY,
              existingService.serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationSupportedToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "Identity verification cannot be supported if client secret is used as authentication method"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest(
      "should fail validation when client level of confidence is not selected",
      async () => {
        const noCacheMiddleware =
          await import("../../../src/middleware/no-cache-middleware.js");
        vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
          async (req: any, res: any, next: any): Promise<void> => {
            req.session.newClientConfig = {
              ...defaultBaseClientValues,
              ...defaultJWKSClientValues,
              isIdentityVerificationSupported: true,
              claims: [],
              landingPageUrl: "https://test.com/landing-page",
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
              PATH_NAMES.CREATE_CLIENT_SUMMARY,
              existingService.serviceId
            )
          )
          .then((res: Response) => {
            const $ = cheerio.load(res.text);
            identityVerificationSupportedToken = $("[name=_csrf]").val();
          });

        const res = await identityVerificationSupportedRequestAgent
          .post(
            getServicePaths(
              PATH_NAMES.CREATE_CLIENT_SUMMARY,
              existingService.serviceId
            )
          )
          .type("form")
          .send({
            _csrf: identityVerificationSupportedToken,
          });
        const $ = cheerio.load(res.text);
        expect($(testComponent("error-summary")).text()).toContain(
          "You must select one level of confidence"
        );
        expect(res.statusCode).toBe(400);
      }
    );

    integrationTest("should pass validation with valid config", async () => {
      const noCacheMiddleware =
        await import("../../../src/middleware/no-cache-middleware.js");
      vi.spyOn(noCacheMiddleware, "noCacheMiddleware").mockImplementation(
        async (req: any, res: any, next: any): Promise<void> => {
          req.session.newClientConfig = {
            ...defaultBaseClientValues,
            ...defaultIdentityVerificationSupportedClientValues,
            ...defaultJWKSClientValues,
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
            PATH_NAMES.CREATE_CLIENT_SUMMARY,
            existingService.serviceId
          )
        )
        .then((res: Response) => {
          const $ = cheerio.load(res.text);
          identityVerificationSupportedToken = $("[name=_csrf]").val();
        });

      const res = await identityVerificationSupportedRequestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SUMMARY,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: identityVerificationSupportedToken,
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SUCCESS,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    });
  });
});
