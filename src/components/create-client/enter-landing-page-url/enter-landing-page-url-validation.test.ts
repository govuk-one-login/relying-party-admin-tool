import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { RequestBuilder } from "../../../utils/test-utils/builders.js";
import { validateEnterLandingPageUrlRequest } from "./enter-landing-page-url-validation.js";

describe("enter landing page url validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateEnterLandingPageUrlRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateEnterLandingPageUrlRequest", () => {
    it("should pass validation with valid URL", async () => {
      req.body = {
        "landing-page-url": "url.com",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should pass validation when empty", async () => {
      req.body = {};

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail validation when URL is invalid", async () => {
      req.body = {
        "landing-page-url": "not-a-url",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray[0].msg).toBe(
        "Your landing page URL must be a valid URL"
      );
    });
  });
});
