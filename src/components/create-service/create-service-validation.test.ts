import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../types.js";
import { RequestBuilder } from "../../utils/test-utils/builders.js";
import { validateServiceRequest } from "./create-service-validation.js";

describe("create service validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateServiceRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateServiceRequest", () => {
    it("should pass validation with valid service name", async () => {
      req.body = {
        name: "my service",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      req.body = {
        name: "",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(2); // fails ASCII validation too
      expect(errorsArray[0].msg).toBe("Enter your service name");
    });

    it("should fail validation when name exceeds 256 characters", async () => {
      const longPassword = "a".repeat(257);
      req.body = {
        name: longPassword,
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(1);
      expect(errorsArray[0].msg).toBe(
        "Your service name must be less than 256 characters long"
      );
    });

    it("should fail validation when name has non-ascii characters", async () => {
      req.body = {
        name: "🆕 service",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(1);
      expect(errorsArray[0].msg).toBe(
        "Your service name must only use ASCII characters"
      );
    });
  });
});
