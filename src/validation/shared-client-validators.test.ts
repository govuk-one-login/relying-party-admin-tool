import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  validClaimsValidator,
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
      const claims = ["https://vocab.account.gov.uk/v1/coreIdentityJWT"];

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
});
