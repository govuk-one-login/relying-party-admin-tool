import { Request } from "express";
import * as validation from "../../../utils/validation.js";
import { enterClientNameFieldValidator } from "./enter-client-name-validation.js";
import { InvalidField } from "../../../utils/types.js";

describe("enter client name validation", () => {
  let req: Partial<Request>;

  beforeEach(() => {
    req = {};

    const stub = vi.spyOn(validation, "renderBadRequestFields");
    stub.mockReturnValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateEnterClientNameRequest", () => {
    it("should pass validation with valid client name", async () => {
      req.body = {
        name: "my client",
      };

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      req.body = {
        name: "",
      };

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter your client name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      const longPassword = "a".repeat(256);
      req.body = {
        name: longPassword,
      };

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2); // because ascii regex also has 255 limit
      expect(errorsArray[0].text[0]).toBe(
        "Your client name must be less than 255 characters long"
      );
    });

    it("should fail validation when name has non-ascii characters", async () => {
      req.body = {
        name: "🆕 client",
      };

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your client name must only use ASCII characters"
      );
    });

    it("should fail validation when name begins with a colon", async () => {
      req.body = {
        name: ":my client",
      };

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your client name cannot start with ':'"
      );
    });
  });
});
