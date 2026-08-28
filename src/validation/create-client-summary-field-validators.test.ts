import { Request } from "express";
import {
  clientNameSummaryFieldValidator,
  redirectUrlsSummaryFieldValidator,
  clientAuthenticationMethodSummaryFieldValidator,
  jwksUrlSummaryFieldValidator,
  publicKeySummaryFieldValidator,
  clientSecretSummaryFieldValidator,
  tokenAuthenticationMethodSummaryFieldValidator,
  scopesSummaryFieldValidator,
} from "./create-client-summary-field-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create client summary field validators", () => {
  describe("clientAuthenticationMethodSummaryFieldValidator", () => {
    it("should fail validation when client authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "",
        })
        .build();

      const result =
        await clientAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe(
        "You must set a client authentication method"
      );
    });

    it("should fail validation when client authentication method is invalid method", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "invalid-method",
        })
        .build();

      const result =
        await clientAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid client authentication method provided: "invalid-method"'
      );
    });
  });

  describe("jwksUrlSummaryFieldValidator", () => {
    it("should pass validation when client authentication method is JWKS and valid url", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is JWKS and invalid url", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "not-a-url",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Your JWKS URL must be a valid URL");
    });

    it("should fail validation when client authentication method is JWKS and empty jwks url", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a JWKS endpoint URL");
    });

    it("should fail validation when client token authentication method is not private_key_jwt", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL"
      );
    });
  });

  describe("publicKeySummaryFieldValidator", () => {
    it("should pass validation when client authentication method is STATIC and valid pem key", async () => {
      let req: Partial<Request>;
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is STATIC and invalid pem key", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: "not-a-key",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Please enter a valid PEM key");
    });

    it("should fail validation when client authentication method is STATIC and empty public key", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: "",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a public key");
    });

    it("should fail validation when client token authentication method is not private_key_jwt", async () => {
      let req: Partial<Request>;
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      let req: Partial<Request>;
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });
  });

  describe("clientSecretSummaryFieldValidator", () => {
    it("should pass validation when client authentication method is CLIENT_SECRET and valid client secret", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is CLIENT_SECRET and empty client secret", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Enter a client secret");
    });

    it("should fail validation when client token authentication method is not client_secret_post", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(
        req as Request
      );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });
  });

  describe("clientNameSummaryFieldValidator", () => {
    it("should pass validation with valid client name", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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
        .withSessionnewClientConfig({
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

  describe("scopesSummaryFieldValidator", () => {
    it("should pass validation with valid scope", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["openid"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation without openid scopes", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["email", "phone"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe('Scopes must contain "openid"');
    });

    it("should fail validation with empty scopes", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: [],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe('Scopes must contain "openid"');
    });

    it("should fail validation with an invalid scope", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["openid", "email", "invalid-scope"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req as Request);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid scope provided: "invalid-scope"'
      );
    });
  });

  describe("tokenAuthenticationMethodSummaryFieldValidator", () => {
    it("should pass validation when client authentication method is CLIENT_SECRET and token authentication method is client_secret_post", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is CLIENT_SECRET and token authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should fail validationwhen client authentication method is CLIENT_SECRET and token authentication method is not client_secret_post", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should pass validation when client authentication method is STATIC and token authentication method is private_key_jwt", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is STATIC and token authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should fail validationwhen client authentication method is STATIC and token authentication method is not private_key_jwt", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should pass validation when client authentication method is JWKS and token authentication method is empty", async () => {
      let req: Partial<Request>;
      req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(
          req as Request
        );

      expect(result.isValid).toBe(true);
    });
  });
});
