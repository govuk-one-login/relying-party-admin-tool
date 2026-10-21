import request, { Response } from "supertest";
import * as cheerio from "cheerio";
import { PATH_NAMES } from "../../../src/app.constants.js";
import { integrationTest } from "../../base.js";
import { getServicePaths, testComponent } from "../../helpers/helpers.js";
import { randomUUID } from "crypto";
import {
  setUpTestWithExistingUserAndService,
  teardownTestWithExistingUserAndService,
} from "../../helpers/test-setup.js";

describe("Integration:: edit id token signing algorithm", () => {
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
        .get(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
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

  integrationTest(
    "should return edit id token signing algorithm page",
    async () => {
      const res = await requestAgent.get(
        getServicePaths(
          PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
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
            PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
            serviceId
          )
        )
        .type("form")
        .send({
          "id-token-signing-algorithm": "ES256",
        });
      expect(res.statusCode).toBe(403);
      expect(res.text).toContain("You do not have access to this page.");
    }
  );

  integrationTest(
    "should return validation error when algorithm is empty",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("id-token-signing-algorithm-error")).text()
      ).toContain("ID token signing algorithm is required");
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should return validation error when algorithm is an invalid algorithm",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "id-token-signing-algorithm": "invalid-algorithm",
        });
      const $ = cheerio.load(res.text);
      expect(
        $(testComponent("id-token-signing-algorithm-error")).text()
      ).toContain(
        'Invalid ID token signing algorithm provided: "invalid-algorithm"'
      );
      expect(res.statusCode).toBe(400);
    }
  );

  integrationTest(
    "should redirect to /clients when valid id token signing algorithm",
    async () => {
      const res = await requestAgent
        .post(
          getServicePaths(
            PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
            serviceId
          )
        )
        .type("form")
        .send({
          _csrf: token,
          "id-token-signing-algorithm": "ES256",
        })
        .expect("Location", getServicePaths(PATH_NAMES.CLIENT, serviceId));
      expect(res.statusCode).toBe(302);
    }
  );
});
