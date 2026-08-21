import { Request } from "express";
import {
  clientNameSummaryFieldValidator,
  redirectUrlsSummaryFieldValidator,
} from "./create-client-summary-field-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create client summary field validators", () => {
  describe("clientNameSummaryFieldValidator", () => {
    it("should pass validation with valid client name", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          name: "my client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          name: "",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter your client name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      let req: Partial<Request>;
      const longName = "a".repeat(256);
      req = new RequestBuilder()
        .withSessionNewClientData({
          name: longName,
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(
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
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          name: "🆕 client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(
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
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          name: ":my client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(
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

  describe("redirectUrlsSummaryFieldValidator", () => {
    it("should pass validation with valid redirect url", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: ["http://url.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid redirect urls", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: ["http://url.com", "http://url2.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when redirect urls is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: [],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "You must have at least one redirect URL"
      );
    });

    it("should fail validation when redirect url is not a URL", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: ["not-a-url"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your redirect URL must be a valid URL"
      );
    });

    it("should fail validation when redirect url contains an invalid query parameter", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: ["http://url.com?response"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "You have entered a redirect URL with an invalid query parameter name"
      );
    });

    it("should fail validation when redirect url contains an invalid scheme", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          redirectUrls: ["javascript://url.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "You have entered a redirect URL with an invalid scheme"
      );
    });
  });
});
