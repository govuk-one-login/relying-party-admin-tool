import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  validClaimsValidator,
  productionUrlValidator,
  redirectUrlValidator,
  idTokenSigningAlgorithmValidator,
  validScopesValidator,
  postLogoutRedirectUrlValidator,
} from "./shared-client-validators.js";

describe("shared client validator tests", () => {
  describe("client name validator", () => {
    it("should return invalid result when clientName has an invalid length", async () => {
      const name = "a".repeat(255);

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name must be less than 255 characters long",
      ]);
    });

    it("should return invalid result when clientName has non-ASCII characters", async () => {
      const name = "My 🆕 Client";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return invalid result when clientName starts with a colon", async () => {
      const name = ":My Test Client";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name cannot start with ':'",
      ]);
    });

    it("should return invalid result when clientName has only whitespace characters", async () => {
      const name = "    ";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Enter your client name",
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return invalid result when clientName is empty string", async () => {
      const name = "";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Enter your client name",
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return valid result when clientName starts and ends with a whitespace", async () => {
      const name = " test ";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeValid();
    });
  });

  describe("claims validator", () => {
    it("should pass validation with valid claims", async () => {
      const claims = [
        "https://vocab.account.gov.uk/v1/passport",
        "https://vocab.account.gov.uk/v1/drivingPermit",
        "https://vocab.account.gov.uk/v1/coreIdentityJWT",
        "https://vocab.account.gov.uk/v1/address",
        "https://vocab.account.gov.uk/v1/returnCode",
      ];

      const result = await validClaimsValidator.validate(claims);

      expect(result).toBeValid();
    });

    it("should pass validation when claims are empty", async () => {
      const claims: string[] = [];

      const result = await validClaimsValidator.validate(claims);

      expect(result).toBeValid();
    });

    it("should fail validation when invalid claim added", async () => {
      const claims = ["not-a-claim"];

      const result = await validClaimsValidator.validate(claims);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        'Invalid claim provided: "not-a-claim"',
      ]);
    });
  });

  describe("jwks url validator", () => {
    it("should pass validation when valid url", async () => {
      const jwksUrl = "https://url.com";

      const result = await jwksUrlValidator.validate(jwksUrl);

      expect(result).toBeValid();
    });

    it("should fail validation when invalid url", async () => {
      const jwksUrl = "not-a-url";

      const result = await jwksUrlValidator.validate(jwksUrl);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors(["Your JWKS URL must be a valid URL"]);
    });
  });

  describe("public key validator", () => {
    it("should pass validation when valid pem key", async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret

      const result = await publicKeyValidator.validate(validPublicKey);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when invalid pem key", async () => {
      const publicKey = "not-a-key";

      const result = await publicKeyValidator.validate(publicKey);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors(["Please enter a valid PEM key"]);
    });
  });

  describe("production valid url validator", () => {
    beforeAll(() => {
      process.env.ENVIRONMENT = "production";
    });

    afterAll(() => {
      process.env.ENVIRONMENT = "";
    });

    it("should pass validation with valid https URL", async () => {
      const testUrl = "https://url.com";

      const result = await productionUrlValidator("test URL").validate(testUrl);

      expect(result).toBeValid();
    });

    it("should fail validation when URL is http", async () => {
      const testUrl = "http://url.com";

      const result = await productionUrlValidator("test URL").validate(testUrl);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your test URL does not have a valid URL protocol",
      ]);
    });

    it("should fail validation when URL is localhost", async () => {
      const testUrl = "https://localhost:3000";

      const result = await productionUrlValidator("test URL").validate(testUrl);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your test URL must not use a local hostname",
      ]);
    });
  });

  describe("redirect url validator", () => {
    describe("redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        const redirectUrl = "http://url.com";

        const result = await redirectUrlValidator.validate(redirectUrl);

        expect(result).toBeValid();
      });

      it("should fail validation when redirect url input is empty", async () => {
        const result = await redirectUrlValidator.validate("");

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "Enter a redirect URL",
          "Your redirect URL must be a valid URL",
        ]);
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        const redirectUrl = "not-a-url";

        const result = await redirectUrlValidator.validate(redirectUrl);

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "Your redirect URL must be a valid URL",
        ]);
      });

      it("should fail validation when redirect url contains an invalid query parameter", async () => {
        const redirectUrl = "http://url.com?response";

        const result = await redirectUrlValidator.validate(redirectUrl);

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "You have entered a redirect URL with an invalid query parameter name",
        ]);
      });

      it("should fail validation when redirect url contains an invalid scheme", async () => {
        const redirectUrl = "javascript://url.com";

        const result = await redirectUrlValidator.validate(redirectUrl);

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "You have entered a redirect URL with an invalid scheme",
        ]);
      });
    });
  });

  describe("post logout redirect url validator", () => {
    describe("post logout redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        const redirectUrl = "http://url.com";

        const result =
          await postLogoutRedirectUrlValidator.validate(redirectUrl);

        expect(result).toBeValid();
      });

      it("should fail validation when redirect url input is empty", async () => {
        const result = await postLogoutRedirectUrlValidator.validate("");

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "Enter a post logout redirect URL",
          "Your post logout redirect URL must be a valid URL",
        ]);
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        const redirectUrl = "not-a-url";

        const result =
          await postLogoutRedirectUrlValidator.validate(redirectUrl);

        expect(result).toBeInvalid();
        expect(result).toHaveInvalidErrors([
          "Your post logout redirect URL must be a valid URL",
        ]);
      });
    });
  });

  describe("id token signing algorithm validator", () => {
    it.each(["RS256", "ES256"])(
      "should pass validation with valid algorithm: %s",
      async (idTokenSigningAlgorithm) => {
        const result = await idTokenSigningAlgorithmValidator.validate(
          idTokenSigningAlgorithm
        );

        expect(result).toBeValid();
      }
    );

    it("should fail validation when algorithm is empty string", async () => {
      const idTokenSigningAlgorithm = "";

      const result = await idTokenSigningAlgorithmValidator.validate(
        idTokenSigningAlgorithm
      );

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "ID token signing algorithm is required",
        'Invalid ID token signing algorithm provided: ""',
      ]);
    });

    it("should fail validation when invalid claim added", async () => {
      const idTokenSigningAlgorithm = "invalid-algorithm";

      const result = await idTokenSigningAlgorithmValidator.validate(
        idTokenSigningAlgorithm
      );

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        'Invalid ID token signing algorithm provided: "invalid-algorithm"',
      ]);
    });
  });

  describe("scope validator", () => {
    it("should pass validation with valid scopes", async () => {
      const scopes = [
        "openid",
        "phone",
        "email",
        "wallet-subject-id",
        "am",
        "doc-checking-app",
        "govuk-account",
        "offline_access",
      ];

      const result = await validScopesValidator.validate(scopes);

      expect(result).toBeValid();
    });

    it("should pass validation when scopes are empty", async () => {
      const scopes: string[] = [];

      const result = await validScopesValidator.validate(scopes);

      expect(result).toBeValid();
    });

    it("should fail validation when invalid scopes added", async () => {
      const scopes = ["not-a-scope"];

      const result = await validScopesValidator.validate(scopes);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        'Invalid scope provided: "not-a-scope"',
      ]);
    });
  });
});
