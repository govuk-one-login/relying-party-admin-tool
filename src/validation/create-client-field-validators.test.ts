import { Request } from "express";
import {
  enterClientNameFieldValidator,
  selectClaimsFieldValidator,
  selectScopesFieldValidator,
} from "./create-client-field-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create client field validators", () => {
  describe("enterClientNameFieldValidator", () => {
    it("should pass validation with valid client name", async () => {
      let req: Partial<Request>;
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
      let req: Partial<Request>;
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
      let req: Partial<Request>;
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
      let req: Partial<Request>;
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
      let req: Partial<Request>;
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

  describe("selectClaimsFieldValidator", () => {
    it("should pass validation with valid claims and identity verification is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-claims": [
            "https://vocab.account.gov.uk/v1/coreIdentityJWT",
          ],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid claims and identity verification false", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({ isIdentityVerificationSupported: false })
        .withBody({
          "selected-claims": [
            "https://vocab.account.gov.uk/v1/coreIdentityJWT",
          ],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid claims and identity verification true", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({ isIdentityVerificationSupported: true })
        .withBody({
          "selected-claims": [
            "https://vocab.account.gov.uk/v1/coreIdentityJWT",
          ],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when claims are empty and identity verification is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-claims": [],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when claims are empty and identity verification is false", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({ isIdentityVerificationSupported: false })
        .withBody({
          "selected-claims": [],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when claims are empty and identity verification is true", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({ isIdentityVerificationSupported: true })
        .withBody({
          "selected-claims": [],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Claims cannot be empty when identity verification is supported"
      );
    });

    it("should fail validation when invalid claim added", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-claims": ["not-a-claim"],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid claim provided: "not-a-claim"'
      );
    });
  });

  describe("selectScopesFieldValidator", () => {
    it("should pass validation with valid scope", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-scopes": "email",
        })
        .build();

      const result = await selectScopesFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid scopes", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-scopes": ["email", "phone"],
        })
        .build();

      const result = await selectScopesFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with empty scopes", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-scopes": "",
        })
        .build();

      const result = await selectScopesFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation with an invalid scope", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "selected-scopes": ["email", "invalid-scope"],
        })
        .build();

      const result = await selectScopesFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid scope provided: "invalid-scope"'
      );
    });
  });
});
