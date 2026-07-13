import { Request } from "express";
import { validationResult } from "express-validator";
import * as formValidationMiddleware from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { RequestBuilder } from "../../../utils/test-utils/builders.js";
import { validateEnterClientNameRequest } from "./enter-client-name-validation.js";

describe("enter client name validation", () => {
  let req: Partial<Request>;
  let validators: ValidationChainFunc;

  beforeEach(() => {
    req = new RequestBuilder().build();

    const stub = vi.spyOn(formValidationMiddleware, "validateBodyMiddleware");
    stub.mockReturnValue(() => {});

    validators = validateEnterClientNameRequest();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateEnterClientNameRequest", () => {
    it("should pass validation with valid client name", async () => {
      req.body = {
        name: "my client",
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
      expect(errorsArray[0].msg).toBe("Enter your client name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      const longPassword = "a".repeat(256);
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
        "Your client name must be less than 255 characters long"
      );
    });

    it("should fail validation when name has non-ascii characters", async () => {
      req.body = {
        name: "🆕 client",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(1);
      expect(errorsArray[0].msg).toBe(
        "Your client name must only use ASCII characters"
      );
    });

    it("should fail validation when name begins with a colon", async () => {
      req.body = {
        name: ":my client",
      };

      for (const validator of validators) {
        await validator(req as Request, {} as any, () => {});
      }

      const errors = validationResult(req as Request);

      expect(errors.isEmpty()).toBe(false);

      const errorsArray = errors.array();

      expect(errorsArray).length(1);
      expect(errorsArray[0].msg).toBe("Your client name cannot start with ':'");
    });
  });
});
