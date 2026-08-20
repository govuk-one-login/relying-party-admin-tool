import { Request } from "express";
import {
  enterClientNameFieldValidator,
  enterRedirectUrlsFieldValidator,
  enterLandingPageUrlFieldValidator,
  selectClaimsFieldValidator,
  selectScopesFieldValidator,
  supportIdentityVerificationFieldValidator,
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

  describe("validateIsIdentityVerificationSupportedRequest", () => {
    it("should pass validation when an option is selected", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "support-identity-verification": "true",
        })
        .build();

      const result = await supportIdentityVerificationFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when support identity verification is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder().withBody({}).build();

      const result = await supportIdentityVerificationFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Choose an option to support identity verification or not"
      );
    });

    it("should fail validation when support identity verification is true and client secret is set", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .withBody({
          "support-identity-verification": "true",
        })
        .build();

      const result = await supportIdentityVerificationFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Identity verification cannot be supported if client secret is used as authentication method"
      );
    });

    it("should pass validation when support identity verification is false and client secret is set", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionNewClientData({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .withBody({
          "support-identity-verification": "false",
        })
        .build();

      const result = await supportIdentityVerificationFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateEnterLandingPageUrlRequest", () => {
    it("should pass validation with valid URL", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "landing-page-url": "http://url.com",
        })
        .build();

      const result = await enterLandingPageUrlFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder().withBody({}).build();

      const result = await enterLandingPageUrlFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when URL is invalid", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withBody({
          "landing-page-url": "not-a-url",
        })
        .build();

      const result = await enterLandingPageUrlFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your landing page URL must be a valid URL"
      );
    });

    describe("production environment", () => {
      beforeAll(() => {
        process.env.ENVIRONMENT = "production";
      });

      afterAll(() => {
        process.env.ENVIRONMENT = "";
      });

      it("should pass validation with valid https URL", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            "landing-page-url": "https://url.com",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(true);
      });

      it("should pass validation when empty", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder().withBody({}).build();

        const result = await enterLandingPageUrlFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when URL is invalid", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            "landing-page-url": "not-a-url",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your landing page URL must be a valid URL"
        );
      });

      it("should fail validation when URL is http", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            "landing-page-url": "http://url.com",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your landing page URL does not have a valid URL protocol"
        );
      });

      it("should fail validation when URL is localhost", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            "landing-page-url": "https://localhost:3000",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your landing page URL must not use a local hostname"
        );
      });
    });
  });

  describe("enterRedirectUrlsFieldValidator", () => {
    describe("redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when redirect url input is empty", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is empty string", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": " ",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "not-a-url",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
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

      it("should fail validation when redirect url already exists in the table", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com",
            "redirect-urls": ["http://url.com"],
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "You have already added this redirect URL"
        );
      });

      it("should fail validation when redirect url contains an invalid query parameter", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com?response",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
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
          .withBody({
            action: "add",
            "redirect-url-input": "javascript://url.com",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
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

    describe("redirect url table", () => {
      it("should pass validation with one valid redirect url", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "continue",
            "redirect-urls": "http://url.com",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(true);
      });

      it("should pass validation with valid redirect urls", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "continue",
            "redirect-urls": ["http://url.com", "http://url2.com"],
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
          req as Request
        );

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when table is empty", async () => {
        let req: Partial<Request>;
        req = new RequestBuilder()
          .withBody({
            action: "continue",
          })
          .build();

        const result = await enterRedirectUrlsFieldValidator.validate(
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
