import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { randomUUID } from "crypto";
import { defaultBaseClientValues } from "../../helpers/default-client-values.js";
import {
  setUpTestWithExistingUserAndService,
  teardownTestWithExistingUserAndService,
} from "../../helpers/test-setup.js";

describe("Integration:: create client summary", () => {
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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "JWKS",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "JWKS",
            jwksURL: "https://url.com",
            clientTokenAuthenticationMethod: "client_secret_post",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "JWKS",
            jwksURL: "https://url.com",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            ...defaultBaseClientValues,
            clientAuthenticationMethod: "JWKS",
            jwksURL: "https://url.com",
            clientTokenAuthenticationMethod: "private_key_jwt",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "STATIC",
          };
          return next();
        });

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
          "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "STATIC",
            publicKey: validPublicKey,
            clientTokenAuthenticationMethod: "client_secret_post",
          };
          return next();
        });

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
          "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "STATIC",
            publicKey: validPublicKey,
          };
          return next();
        });

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
          "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            ...defaultBaseClientValues,
            clientAuthenticationMethod: "STATIC",
            publicKey: validPublicKey,
            clientTokenAuthenticationMethod: "private_key_jwt",
          };
          return next();
        });

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
      "should fail validation when client authentication method is STATIC and empty public key",
      async () => {
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "CLIENT_SECRET",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "CLIENT_SECRET",
            clientSecret: "client-secret", // pragma: allowlist secret
            clientTokenAuthenticationMethod: "private_key_jwt",
          };
          return next();
        });

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
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            clientAuthenticationMethod: "CLIENT_SECRET",
            clientSecret: "client-secret", // pragma: allowlist secret
          };
          return next();
        });

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
      "should pass validation when client authentication method is STATIC and valid public key",
      async () => {
        const checkServiceExistsMiddleware =
          await import("../../../src/middleware/check-service-exists-middleware.js");
        vi.spyOn(
          checkServiceExistsMiddleware,
          "serviceExistsMiddleware"
        ).mockImplementation(function async(
          req: any,
          res: any,
          next: any
        ): Promise<void> {
          req.session.newClientConfig = {
            ...defaultBaseClientValues,
            clientAuthenticationMethod: "CLIENT_SECRET",
            clientSecret: "client-secret", // pragma: allowlist secret
            clientTokenAuthenticationMethod: "client_secret_post",
          };
          return next();
        });

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
});
