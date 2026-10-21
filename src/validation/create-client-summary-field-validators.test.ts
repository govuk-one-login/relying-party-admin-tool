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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "",
        })
        .build();

      const result =
        await clientAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe(
        "You must set a client authentication method"
      );
    });

    it("should fail validation when client authentication method is invalid method", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "invalid-method",
        })
        .build();

      const result =
        await clientAuthenticationMethodSummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is JWKS and invalid url", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "not-a-url",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Your JWKS URL must be a valid URL");
    });

    it("should fail validation when client authentication method is JWKS and empty jwks url", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a JWKS endpoint URL");
    });

    it("should fail validation when client token authentication method is not private_key_jwt", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
          jwksURL: "https://url.com",
        })
        .build();

      const result = await jwksUrlSummaryFieldValidator.validate(req);

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
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is STATIC and invalid pem key", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: "not-a-key",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(3);
      expect(errorsArray[0].text[0]).toBe("Please enter a valid PEM key");
    });

    it("should fail validation when client authentication method is STATIC and valid private key", async () => {
      const privateKey =
        "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCdQ5ikBNzPwBNy+wJU4PE7HF04U7+4NTJV/N7LP0fs37LGEZR8\nPIXbEJ9XpBfeXcCIOmL/oGcri5G5pBjDhyVvfk4mS+x35rVo70ZZNg71ZtEGcSMS\ne4efuxB/h/+4vVlhMgE6TjtkqXNTaLjHCjqwOEhRjXqmX0tmaDA3Z489wQIDAQAB\nAoGAAL5vHGeBe+IWtXaGfkxKF9N8hWWwBHkL8eguTZvRBUfRmqo+n4/RukWL22hF\nTKH45SwRh9AEbOpOGCi0jUg4Xxq32yIKepFykyrYjKmFhvrUGXRrW0oHzrnF9hIl\nlJ5jJxXzKHf5M0oR+IQfrwo+MRIoWKpmYy1+pI+ssoQF8gECQQDq4qTz+OYBNFYY\nEJ2xOk+16iNDW2sy1hBI6uvSPN2OfLVzH4s2yb4aLNT3T+ynnHtP1pH2i4PSW7vp\nl2Ggr+gxAkEAq2asXuDmMIjS5/W5zv8s1FidYfYjqTur3pYD7jQvcR2E2RslEsMw\nPvUUqWY9iuQkGnlTnlKUm/LsTAJhkaPakQJBAKEZA5PFkVMgJzBoLQ/B86vMQ5VO\nHS8HvLGWVlminz677+NerifMpJLlTse0zJaE79ppS0EynR3pBvAGgNIp8/ECQDwx\nH2Fma5ApzJ8nHSyDUlP0Frj7PoTE7tOJLTIu42Y+7pNrw/Y107CYUrw2qnAnNEKT\nzvivmX62raL3xxnlR/ECQBmTYNJj4N29Hx1dxTpnMcgNii2H+1LrnvTCm0lkWkYp\n5W2Eb44mjLw+57TFk1TJOKLdtE69zbio7uLAPTNCZ8Y=\n-----END RSA PRIVATE KEY-----"; // pragma: allowlist secret

      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: privateKey,
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Please enter a valid public key");
    });

    it("should fail validation when client authentication method is STATIC and valid non-rsa key", async () => {
      const publicKey =
        "-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAElr7n+HAN7io+Nzl7PqWNy5a4DrOYNkWA\nK4kkf3FSnx7fThZCdwP4m/PI5xIxoxlhJX4eHmaKm8S6c2oWxtt1YQ==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: publicKey,
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Please enter a valid RSA public key"
      );
    });

    it("should fail validation when client authentication method is STATIC and empty public key", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: "",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(4);
      expect(errorsArray[0].text[0]).toBe("Enter a public key");
    });

    it("should fail validation when client token authentication method is not private_key_jwt", async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          publicKey: validPublicKey,
        })
        .build();

      const result = await publicKeySummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is CLIENT_SECRET and empty client secret", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Enter a client secret");
    });

    it("should fail validation when client token authentication method is not client_secret_post", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should fail validation when client token authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: "client-secret", // pragma: allowlist secret
        })
        .build();

      const result = await clientSecretSummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          name: "my client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          name: "",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter your client name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      const longName = "a".repeat(256);
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          name: longName,
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2); // because ascii regex also has 255 limit
      expect(errorsArray[0].text[0]).toBe(
        "Your client name must be less than 255 characters long"
      );
    });

    it("should fail validation when name has non-ascii characters", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          name: "🆕 client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your client name must only use ASCII characters"
      );
    });

    it("should fail validation when name begins with a colon", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          name: ":my client",
        })
        .build();

      const result = await clientNameSummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: ["http://url.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid redirect urls", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: ["http://url.com", "http://url2.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when redirect urls is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: [],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "You must have at least one redirect URL"
      );
    });

    it("should fail validation when redirect url is not a URL", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: ["not-a-url"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your redirect URL must be a valid URL"
      );
    });

    it("should fail validation when redirect url contains an invalid query parameter", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: ["http://url.com?response"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "You have entered a redirect URL with an invalid query parameter name"
      );
    });

    it("should fail validation when redirect url contains an invalid scheme", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          redirectUrls: ["javascript://url.com"],
        })
        .build();

      const result = await redirectUrlsSummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["openid"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation without openid scopes", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["email", "phone"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe('Scopes must contain "openid"');
    });

    it("should fail validation with empty scopes", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: [],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe('Scopes must contain "openid"');
    });

    it("should fail validation with an invalid scope", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          scopes: ["openid", "email", "invalid-scope"],
        })
        .build();

      const result = await scopesSummaryFieldValidator.validate(req);

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
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is CLIENT_SECRET and token authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should fail validationwhen client authentication method is CLIENT_SECRET and token authentication method is not client_secret_post", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be client_secret_post if client authentication method is client secret"
      );
    });

    it("should pass validation when client authentication method is STATIC and token authentication method is private_key_jwt", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          clientTokenAuthenticationMethod: "private_key_jwt",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is STATIC and token authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should fail validationwhen client authentication method is STATIC and token authentication method is not private_key_jwt", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "STATIC",
          clientTokenAuthenticationMethod: "client_secret_post",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Token authentication method must be private_key_jwt if client authentication method is a public key"
      );
    });

    it("should pass validation when client authentication method is JWKS and token authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "JWKS",
        })
        .build();

      const result =
        await tokenAuthenticationMethodSummaryFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });
  });
});
