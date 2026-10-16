import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { User } from "../../../src/models/user.js";
import { UserPermission } from "../../../src/models/permissions.js";
import { Relation } from "../../../src/models/relation.js";
import { Service } from "../../../src/models/service.js";
import { randomUUID } from "crypto";

describe("Integration:: edit client authentication method", () => {
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
  const existingRelation: Relation = {
    userId: existingUserId,
    object: `service:${serviceId}`,
    relation: UserPermission.WRITER_INT,
  };
  const existingService: Service = {
    serviceId: serviceId,
    name: "Test service",
  };

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
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
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
    "should return edit client authentication method page",
    async () => {
      const res = await requestAgent.get(
        getServicePaths(
          PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
          existingService.serviceId
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
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "http://url.com",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should fail validation when client authentication method is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "",
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("client-authentication-method-error")).text()
      ).toContain("Choose a client authentication method");
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is JWKS and invalid url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "not-a-url",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("jwks-endpoint-error")).text()).toContain(
        "Your JWKS URL must be a valid URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is JWKS and empty jwks endpoint",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("jwks-endpoint-error")).text()).toContain(
        "Enter a JWKS endpoint URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is not JWKS and valid url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "STATIC",
          "jwks-endpoint": "",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("public-key-error")).text()).toContain(
        "Enter a public key"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is STATIC and invalid pem key",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "STATIC",
          "public-key": "not-a-key",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("public-key-error")).text()).toContain(
        "Please enter a valid PEM key"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is STATIC and empty public key",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "STATIC",
          "public-key": "",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("public-key-error")).text()).toContain(
        "Enter a public key"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is not STATIC and valid pem key",
    async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "CLIENT_SECRET",
          "public-key": validPublicKey,
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("client-secret-error")).text()).toContain(
        "Enter a client secret"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is CLIENT_SECRET and empty client secret",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "CLIENT_SECRET",
          "client-secret": "",
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("client-secret-error")).text()).toContain(
        "Enter a client secret"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should fail validation when client authentication method is not CLIENT_SECRET and valid client secret",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "JWKS",
          "client-secret": "client-secret", // pragma: allowlist secret
        });
      const $ = cheerio.load(res.text);
      expect($(testComponent("jwks-endpoint-error")).text()).toContain(
        "Enter a JWKS endpoint URL"
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /summary when client authentication method is JWKS and valid url",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "https://url.com",
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SUMMARY,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /summary when client authentication method is STATIC and valid pem key",
    async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "STATIC",
          "public-key": validPublicKey,
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SUMMARY,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );

  integrationTest(
    "should redirect to /summary when client authentication method is CLIENT_SECRET and valid client secret",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION,
            existingService.serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "client-authentication-method": "CLIENT_SECRET",
          "client-secret": "client-secret", // pragma: allowlist secret
        })
        .expect(
          "Location",
          getServicePaths(
            PATH_NAMES.CREATE_CLIENT_SUMMARY,
            existingService.serviceId
          )
        );
      expect(res.statusCode).toBe(302);
    }
  );
});
