import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { RequestBuilder } from "../../../utils/test-utils/builders.js";
import { validateEnterRedirectUrlsRequest } from "./enter-redirect-urls-validation.js";

describe("enter redirect urls validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateEnterRedirectUrlsRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateEnterRedirectUrlsRequest", () => {
    describe("redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": "http://url.com",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail validation when redirect url input is empty", async () => {
        req.body = {
          action: "add",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray[0].msg).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is empty string", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": " ",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray[0].msg).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": "not-a-url",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray[0].msg).toBe(
          "Your redirect URL must be a valid URL"
        );
      });

      it("should fail validation when redirect url already exists in the table", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": "http://url.com",
          "redirect-urls": ["http://url.com"],
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe(
          "You have already added this redirect URL"
        );
      });

      it("should fail validation when redirect url contains an invalid query parameter", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": "http://url.com?response",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe(
          "You have entered a redirect URL with an invalid query parameter name"
        );
      });

      it("should fail validation when redirect url contains an invalid scheme", async () => {
        req.body = {
          action: "add",
          "redirect-url-input": "javascript://url.com",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe(
          "You have entered a redirect URL with an invalid scheme"
        );
      });
    });

    describe("redirect url table", () => {
      it("should pass validation with valid redirect url", async () => {
        req.body = {
          action: "continue",
          "redirect-urls": ["http://url.com"],
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(true);
      });

      it("should fail validation when table is empty", async () => {
        req.body = {
          action: "continue",
        };

        for (const validator of validators) {
          await validator(req as Request, {} as any, () => {});
        }

        const errors = validationResult(req as Request);

        expect(errors.isEmpty()).toBe(false);

        const errorsArray = errors.array();

        expect(errorsArray).length(1);
        expect(errorsArray[0].msg).toBe(
          "You must have at least one redirect URL"
        );
      });
    });
  });
});
