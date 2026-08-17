import { Request } from "express";
import { enterClientNameFieldValidator } from "./create-client-field-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create client field validators", () => {
  let req: Partial<Request>;

  beforeEach(() => {
    req = new RequestBuilder().withSessionNewClientData({}).build();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("enterClientNameFieldValidator", () => {
    it("should pass validation with valid client name", async () => {
      req = new RequestBuilder()
        .withBody({
          name: "my client",
        })
        .build();

      const result = await enterClientNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      req = new RequestBuilder()
        .withBody({
          name: "",
        })
        .build();

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
      const longName = "a".repeat(256);
      req = new RequestBuilder()
        .withBody({
          name: longName,
        })
        .build();

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
      req = new RequestBuilder()
        .withBody({
          name: "🆕 client",
        })
        .build();

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
      req = new RequestBuilder()
        .withBody({
          name: ":my client",
        })
        .build();

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
