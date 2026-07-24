import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { RequestBuilder } from "../../../utils/test-utils/builders.js";
import { validateIsIdentityVerificationSupportedRequest } from "./support-identity-verification-validation.js";

describe("support identity verification validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateIsIdentityVerificationSupportedRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateIsIdentityVerificationSupportedRequest", () => {
    it("should pass validation when an option is selected", async () => {
      req.body = {
        "support-identity-verification": "true",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail validation when support identity verification is empty", async () => {
      req.body = {};

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(1);
      expect(errorsArray[0].msg).toBe(
        "Choose an option to support identity verification or not"
      );
    });
  });
});
