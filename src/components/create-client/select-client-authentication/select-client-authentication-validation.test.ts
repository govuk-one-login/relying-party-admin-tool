import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { RequestBuilder } from "../../../utils/test-utils/builders.js";
import { validateSelectClientAuthenticationRequest } from "./select-client-authentication-validation.js";

describe("select client authentication method validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateSelectClientAuthenticationRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateSelectClientAuthenticationRequest", () => {
    describe("client authentication method", () => {
      it("should fail validation when client authentication method is empty", async () => {
        req.body = {};

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe("Choose a token authentication method");
      });
    });

    describe("jwks endpoint", () => {
      it("should pass validation with valid JWKs URL", async () => {
        req.body = {
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "http://url.com",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail validation when JWKs URL is empty", async () => {
        req.body = {
          "client-authentication-method": "JWKS",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(2);
        expect(errorsArray[0].msg).toBe("Enter a JWKS endpoint URL");
      });

      it("should fail validation when JWKs URL is not a URL", async () => {
        req.body = {
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "not-a-url",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe("Please enter a valid URL");
      });
    });

    describe("public key", () => {
      it("should pass validation with valid public key", async () => {
        const validPublicKey =
          "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
        req.body = {
          "client-authentication-method": "STATIC",
          "public-key": validPublicKey,
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail validation when public key is empty", async () => {
        req.body = {
          "client-authentication-method": "STATIC",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(2);
        expect(errorsArray[0].msg).toBe("Enter a public key");
      });

      it("should fail validation when public is invalid", async () => {
        req.body = {
          "client-authentication-method": "STATIC",
          "public-key": "not-a-public-key",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe("Please enter a valid PEM key");
      });
    });

    describe("client secret", () => {
      it("should pass validation with valid client secret", async () => {
        req.body = {
          "client-authentication-method": "CLIENT_SECRET",
          "client-secret": "client-secret", // pragma: allowlist secret
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail validation when client secret is empty", async () => {
        req.body = {
          "client-authentication-method": "CLIENT_SECRET",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe("Enter a client secret");
      });
    });
  });
});
