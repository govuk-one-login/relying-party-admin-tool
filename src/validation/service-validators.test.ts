import { Request } from "express";
import { enterServiceNameFieldValidator } from "./service-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create service field validators", () => {
  describe("enterServiceNameFieldValidator", () => {
    it("should pass validation with valid service name", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          name: "my service",
        })
        .build();

      const result = await enterServiceNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          name: "",
        })
        .build();

      const result = await enterServiceNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter your service name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      let req: Partial<Request>;
      const longName = "a".repeat(256);
      req = new RequestBuilder()
        .withBody({
          name: longName,
        })
        .build();

      const result = await enterServiceNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2); // because ascii regex also has 255 limit
      expect(errorsArray[0].text[0]).toBe(
        "Your service name must be less than 255 characters long"
      );
    });

    it("should fail validation when name has non-ascii characters", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          name: "🆕 service",
        })
        .build();

      const result = await enterServiceNameFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your service name must only use ASCII characters"
      );
    });
  });
});
