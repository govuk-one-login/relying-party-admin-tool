import {
  clientNameInputFieldValidator,
  redirectUrlsFieldValidator,
  enterLandingPageUrlFieldValidator,
  selectClaimsFieldValidator,
  scopesFieldValidator,
  supportIdentityVerificationFieldValidator,
  clientAuthenticationInputFieldValidatorChain,
  idTokenSigningAlgorithmFieldValidator,
  isActiveFieldValidator,
  backchannelLogoutUrlFieldValidator,
  postLogoutRedirectUrlsFieldValidator,
  serviceTypeFieldValidator,
  sectorIdentifierUriFieldValidator,
  jarValidationRequiredFieldValidator,
  channelFieldValidator,
  pkceEnforcedFieldValidator,
  selectLevelOfConfidenceFieldValidator,
  allScopesFieldValidator,
  maxAgeEnabledFieldValidator,
  permitMissingNonceFieldValidator,
  rateLimitFieldValidator,
} from "./client-question-field-validators.js";
import { InvalidField } from "../utils/types.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";

describe("create client field validators", () => {
  describe("backchannelLogoutUrlFieldValidator", () => {
    it("should pass validation with valid URL", async () => {
      const req = new RequestBuilder()
        .withBody({
          "backchannel-logout-url": "http://url.com",
        })
        .build();

      const result = await backchannelLogoutUrlFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await backchannelLogoutUrlFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when URL is invalid", async () => {
      const req = new RequestBuilder()
        .withBody({
          "backchannel-logout-url": "not-a-url",
        })
        .build();

      const result = await backchannelLogoutUrlFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your backchannel logout URL must be a valid URL"
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
        const req = new RequestBuilder()
          .withBody({
            "backchannel-logout-url": "https://url.com",
          })
          .build();

        const result = await backchannelLogoutUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation when empty", async () => {
        const req = new RequestBuilder().withBody({}).build();

        const result = await backchannelLogoutUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when URL is invalid", async () => {
        const req = new RequestBuilder()
          .withBody({
            "backchannel-logout-url": "not-a-url",
          })
          .build();

        const result = await backchannelLogoutUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your backchannel logout URL must be a valid URL"
        );
      });

      it("should fail validation when URL is http", async () => {
        const req = new RequestBuilder()
          .withBody({
            "backchannel-logout-url": "http://url.com",
          })
          .build();

        const result = await backchannelLogoutUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your backchannel logout URL does not have a valid URL protocol"
        );
      });

      it("should fail validation when URL is localhost", async () => {
        const req = new RequestBuilder()
          .withBody({
            "backchannel-logout-url": "https://localhost:3000",
          })
          .build();

        const result = await backchannelLogoutUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your backchannel logout URL must not use a local hostname"
        );
      });
    });
  });

  describe("channelFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          channel: "web",
        })
        .build();

      const result = await channelFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when channel is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await channelFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(3);
      expect(errorsArray[0].text[0]).toBe("Channel is required");
    });

    it("should fail validation when invalid channel", async () => {
      const req = new RequestBuilder()
        .withBody({
          channel: "invalid-channel",
        })
        .build();

      const result = await channelFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid channel provided: "invalid-channel"'
      );
    });
  });

  describe("clientAuthenticationInputFieldValidatorChain", () => {
    it("should fail validation when client authentication method is empty", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Choose a client authentication method"
      );
    });

    it("should pass validation when client authentication method is JWKS and valid url", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "https://url.com",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is JWKS and invalid url", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "not-a-url",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Your JWKS URL must be a valid URL");
    });

    it("should fail validation when client authentication method is JWKS and empty jwks endpoint", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "JWKS",
          "jwks-endpoint": "",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a JWKS endpoint URL");
    });

    it("should fail validation when client authentication method is not JWKS and valid url", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "STATIC",
          "jwks-endpoint": "https://url.com",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(4);
      expect(errorsArray[0].text[0]).toBe("Enter a public key");
    });

    it("should pass validation when client authentication method is STATIC and valid pem key", async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "STATIC",
          "public-key": validPublicKey,
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is STATIC and invalid pem key", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "STATIC",
          "public-key": "not-a-key",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

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
        .withBody({
          "client-authentication-method": "STATIC",
          "public-key": privateKey,
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

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
        .withBody({
          "client-authentication-method": "STATIC",
          "public-key": publicKey,
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

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
        .withBody({
          "client-authentication-method": "STATIC",
          "public-key": "",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(4);
      expect(errorsArray[0].text[0]).toBe("Enter a public key");
    });

    it("should fail validation when client authentication method is not STATIC and valid pem key", async () => {
      const validPublicKey =
        "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEYWLbZirhZ9Vn9HYOFKK9LKKug+/S\nNMRVsji1V7qruuB594ffFuQnoVDh8ahfwji90zMwQUWrJjMUhoMxQDIWcw==\n-----END PUBLIC KEY-----"; // pragma: allowlist secret
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "CLIENT_SECRET",
          "public-key": validPublicKey,
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Enter a client secret");
    });

    it("should pass validation when client authentication method is CLIENT_SECRET and valid client secret", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "CLIENT_SECRET",
          "client-secret": "client-secret", // pragma: allowlist secret
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when client authentication method is CLIENT_SECRET and empty client secret", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "CLIENT_SECRET",
          "client-secret": "",
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Enter a client secret");
    });

    it("should fail validation when client authentication method is not CLIENT_SECRET and valid client secret", async () => {
      const req = new RequestBuilder()
        .withBody({
          "client-authentication-method": "JWKS",
          "client-secret": "client-secret", // pragma: allowlist secret
        })
        .build();

      const result =
        await clientAuthenticationInputFieldValidatorChain.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a JWKS endpoint URL");
    });
  });

  describe("clientNameFieldValidator", () => {
    it("should pass validation with valid client name", async () => {
      const req = new RequestBuilder()
        .withBody({
          name: "my client",
        })
        .build();

      const result = await clientNameInputFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when name is empty", async () => {
      const req = new RequestBuilder()
        .withBody({
          name: "",
        })
        .build();

      const result = await clientNameInputFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter your client name");
    });

    it("should fail validation when name exceeds 255 characters", async () => {
      const longName = "a".repeat(256);
      const req = new RequestBuilder()
        .withBody({
          name: longName,
        })
        .build();

      const result = await clientNameInputFieldValidator.validate(req);

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
        .withBody({
          name: "🆕 client",
        })
        .build();

      const result = await clientNameInputFieldValidator.validate(req);

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
        .withBody({
          name: ":my client",
        })
        .build();

      const result = await clientNameInputFieldValidator.validate(req);

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
    it("should pass validation with valid claims", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-claims": [
            "https://vocab.account.gov.uk/v1/coreIdentityJWT",
          ],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when claims are empty", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-claims": [],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when invalid claim added", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-claims": ["not-a-claim"],
        })
        .build();

      const result = await selectClaimsFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid claim provided: "not-a-claim"'
      );
    });
  });

  describe("supportIdentityVerificationFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "support-identity-verification": "true",
        })
        .build();

      const result =
        await supportIdentityVerificationFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when support identity verification is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result =
        await supportIdentityVerificationFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Choose an option to support identity verification or not"
      );
    });

    it("should fail validation when support identity verification is true and client secret is set", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .withBody({
          "support-identity-verification": "true",
        })
        .build();

      const result =
        await supportIdentityVerificationFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Identity verification cannot be supported if client secret is used as authentication method"
      );
    });

    it("should pass validation when support identity verification is false and client secret is set", async () => {
      const req = new RequestBuilder()
        .withSessionnewClientConfig({
          clientAuthenticationMethod: "CLIENT_SECRET",
        })
        .withBody({
          "support-identity-verification": "false",
        })
        .build();

      const result =
        await supportIdentityVerificationFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });
  });

  describe("idTokenSigningAlgorithmFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "id-token-signing-algorithm": "ES256",
        })
        .build();

      const result = await idTokenSigningAlgorithmFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when id token signing algorithm is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await idTokenSigningAlgorithmFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe(
        "ID token signing algorithm is required"
      );
    });

    it("should fail validation when invalid id token signing algorithm", async () => {
      const req = new RequestBuilder()
        .withBody({
          "id-token-signing-algorithm": "invalid-algorithm",
        })
        .build();

      const result = await idTokenSigningAlgorithmFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid ID token signing algorithm provided: "invalid-algorithm"'
      );
    });
  });

  describe("isActiveFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "is-active": "true",
        })
        .build();

      const result = await isActiveFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when is active is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await isActiveFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Select an option");
    });
  });

  describe("jarValidationRequiredFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "jar-validation-required": "true",
        })
        .build();

      const result = await jarValidationRequiredFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when jar validation required is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await jarValidationRequiredFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Select an option");
    });
  });

  describe("enterLandingPageUrlFieldValidator", () => {
    it("should pass validation with valid URL", async () => {
      const req = new RequestBuilder()
        .withBody({
          "landing-page-url": "http://url.com",
        })
        .build();

      const result = await enterLandingPageUrlFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await enterLandingPageUrlFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when URL is invalid", async () => {
      const req = new RequestBuilder()
        .withBody({
          "landing-page-url": "not-a-url",
        })
        .build();

      const result = await enterLandingPageUrlFieldValidator.validate(req);

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
        const req = new RequestBuilder()
          .withBody({
            "landing-page-url": "https://url.com",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation when empty", async () => {
        const req = new RequestBuilder().withBody({}).build();

        const result = await enterLandingPageUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when URL is invalid", async () => {
        const req = new RequestBuilder()
          .withBody({
            "landing-page-url": "not-a-url",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your landing page URL must be a valid URL"
        );
      });

      it("should fail validation when URL is http", async () => {
        const req = new RequestBuilder()
          .withBody({
            "landing-page-url": "http://url.com",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your landing page URL does not have a valid URL protocol"
        );
      });

      it("should fail validation when URL is localhost", async () => {
        const req = new RequestBuilder()
          .withBody({
            "landing-page-url": "https://localhost:3000",
          })
          .build();

        const result = await enterLandingPageUrlFieldValidator.validate(req);

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

  describe("maxAgeEnabledFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "max-age-enabled": "true",
        })
        .build();

      const result = await maxAgeEnabledFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when max age enabled is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await maxAgeEnabledFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Select an option");
    });
  });

  describe("permitMissingNonceFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "permit-missing-nonce": "true",
        })
        .build();

      const result = await permitMissingNonceFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when permit missing nonce is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await permitMissingNonceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Select an option");
    });
  });

  describe("pkceEnforcedFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "pkce-enforced": "true",
        })
        .build();

      const result = await pkceEnforcedFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when PKCE enforced is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await pkceEnforcedFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Select an option");
    });
  });

  describe("postLogoutRedirectUrlsFieldValidator", () => {
    describe("post logout redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "post-logout-redirect-url-input": "http://url.com",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when redirect url input is empty", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a post logout redirect URL");
      });

      it("should fail validation when redirect url input is empty string", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "post-logout-redirect-url-input": " ",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a post logout redirect URL");
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "post-logout-redirect-url-input": "not-a-url",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your post logout redirect URL must be a valid URL"
        );
      });

      it("should fail validation when redirect url already exists in the table", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "post-logout-redirect-url-input": "http://url.com",
            "post-logout-redirect-urls": ["http://url.com"],
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "You have already added this redirect URL"
        );
      });
    });

    describe("post logout redirect url table", () => {
      it("should pass validation with one valid redirect url", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
            "post-logout-redirect-urls": "http://url.com",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation with valid redirect urls", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
            "post-logout-redirect-urls": ["http://url.com", "http://url2.com"],
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation when table is empty", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
          })
          .build();

        const result = await postLogoutRedirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("rateLimitFieldValidator", () => {
    it("should pass validation with valid rate limit", async () => {
      const req = new RequestBuilder()
        .withBody({
          "rate-limit": "10",
        })
        .build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation when empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when a negative number", async () => {
      const req = new RequestBuilder()
        .withBody({
          "rate-limit": "-1",
        })
        .build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Rate limit must be a positive number"
      );
    });

    it("should fail validation when a decimal", async () => {
      const req = new RequestBuilder()
        .withBody({
          "rate-limit": "1.5",
        })
        .build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe("Rate limit must be a whole number");
    });

    it("should fail validation when over the max limit", async () => {
      const req = new RequestBuilder()
        .withBody({
          "rate-limit": "51",
        })
        .build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Rate limit must be below the max limit of 50"
      );
    });

    it("should fail validation when not a number", async () => {
      const req = new RequestBuilder()
        .withBody({
          "rate-limit": "test",
        })
        .build();

      const result = await rateLimitFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(4);
      expect(errorsArray[0].text[0]).toBe("Rate limit must be a number");
    });
  });

  describe("redirectUrlsFieldValidator", () => {
    describe("redirect url input", () => {
      it("should pass validation with valid redirect url", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when redirect url input is empty", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is empty string", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": " ",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a redirect URL");
      });

      it("should fail validation when redirect url input is not a URL", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "not-a-url",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your redirect URL must be a valid URL"
        );
      });

      it("should fail validation when redirect url already exists in the table", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com",
            "redirect-urls": ["http://url.com"],
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "You have already added this redirect URL"
        );
      });

      it("should fail validation when redirect url contains an invalid query parameter", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "add",
            "redirect-url-input": "http://url.com?response",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

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
          .withBody({
            action: "add",
            "redirect-url-input": "javascript://url.com",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

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
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
            "redirect-urls": "http://url.com",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation with valid redirect urls", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
            "redirect-urls": ["http://url.com", "http://url2.com"],
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when table is empty", async () => {
        const req = new RequestBuilder()
          .withBody({
            action: "continue",
          })
          .build();

        const result = await redirectUrlsFieldValidator.validate(req);

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

  describe("scopesFieldValidator", () => {
    it("should pass validation with valid scope", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-scopes": "email",
        })
        .build();

      const result = await scopesFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid scopes", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-scopes": ["email", "phone"],
        })
        .build();

      const result = await scopesFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with empty scopes", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-scopes": "",
        })
        .build();

      const result = await scopesFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation with an invalid scope", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-scopes": ["email", "invalid-scope"],
        })
        .build();

      const result = await scopesFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid scope provided: "invalid-scope"'
      );
    });

    describe("allScopesFieldValidator", () => {
      it("should pass validation with valid scope", async () => {
        const req = new RequestBuilder()
          .withBody({
            "selected-scopes": "email",
          })
          .build();

        const result = await allScopesFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation with valid scopes", async () => {
        const req = new RequestBuilder()
          .withBody({
            "selected-scopes": ["email", "am"],
          })
          .build();

        const result = await allScopesFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should pass validation with empty scopes", async () => {
        const req = new RequestBuilder()
          .withBody({
            "selected-scopes": "",
          })
          .build();

        const result = await allScopesFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation with an invalid scope", async () => {
        const req = new RequestBuilder()
          .withBody({
            "selected-scopes": ["email", "invalid-scope"],
          })
          .build();

        const result = await allScopesFieldValidator.validate(req);

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

  describe("sectorIdentifierUriFieldValidator", () => {
    it("should pass validation with valid URI", async () => {
      const req = new RequestBuilder()
        .withBody({
          "sector-identifier-uri": "http://url.com",
        })
        .build();

      const result = await sectorIdentifierUriFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await sectorIdentifierUriFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Enter a sector identifier URI");
    });

    it("should fail validation when URI is invalid", async () => {
      const req = new RequestBuilder()
        .withBody({
          "sector-identifier-uri": "not-a-uri",
        })
        .build();

      const result = await sectorIdentifierUriFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Your sector identifier URI must be a valid URL"
      );
    });

    describe("production environment", () => {
      beforeAll(() => {
        process.env.ENVIRONMENT = "production";
      });

      afterAll(() => {
        process.env.ENVIRONMENT = "";
      });

      it("should pass validation with valid https URI", async () => {
        const req = new RequestBuilder()
          .withBody({
            "sector-identifier-uri": "https://url.com",
          })
          .build();

        const result = await sectorIdentifierUriFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when empty", async () => {
        const req = new RequestBuilder().withBody({}).build();

        const result = await sectorIdentifierUriFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(2);
        expect(errorsArray[0].text[0]).toBe("Enter a sector identifier URI");
      });

      it("should fail validation when URI is invalid", async () => {
        const req = new RequestBuilder()
          .withBody({
            "sector-identifier-uri": "not-a-uri",
          })
          .build();

        const result = await sectorIdentifierUriFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your sector identifier URI must be a valid URL"
        );
      });

      it("should pass validation when URI is http", async () => {
        const req = new RequestBuilder()
          .withBody({
            "sector-identifier-uri": "http://url.com",
          })
          .build();

        const result = await sectorIdentifierUriFieldValidator.validate(req);

        expect(result.isValid).toBe(true);
      });

      it("should fail validation when URI is localhost", async () => {
        const req = new RequestBuilder()
          .withBody({
            "sector-identifier-uri": "https://localhost:3000",
          })
          .build();

        const result = await sectorIdentifierUriFieldValidator.validate(req);

        expect(result.isValid).toBe(false);

        const errorsArray = (result as InvalidField).errors;

        expect(errorsArray).length(1);
        expect(errorsArray[0].text).length(1);
        expect(errorsArray[0].text[0]).toBe(
          "Your sector identifier URI must not use a local hostname"
        );
      });
    });
  });

  describe("serviceTypeFieldValidator", () => {
    it("should pass validation when an option is selected", async () => {
      const req = new RequestBuilder()
        .withBody({
          "service-type": "MANDATORY",
        })
        .build();

      const result = await serviceTypeFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation when service type is empty", async () => {
      const req = new RequestBuilder().withBody({}).build();

      const result = await serviceTypeFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe("Service type is required");
    });

    it("should fail validation when invalid service type", async () => {
      const req = new RequestBuilder()
        .withBody({
          "service-type": "invalid-service-type",
        })
        .build();

      const result = await serviceTypeFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid service type provided: "invalid-service-type"'
      );
    });
  });

  describe("selectLevelsOfConfidenceFieldValidator", () => {
    it("should pass validation with valid level-of-confidence", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": "P0",
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: true,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should pass validation with valid levels-of-confidence", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": ["P0", "P1"],
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: true,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should not pass validation with empty level-of-confidence", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": "",
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: true,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);
    });

    it("should fail validation with an invalid level-of-confidence", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": ["P0", "invalid-loc"],
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: true,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        'Invalid level of confidence provided: "invalid-loc"'
      );
    });

    it("should pass validation with P0 and identity verification not supported", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": "P0",
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: false,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(true);
    });

    it("should fail validation with identity verification not supported for P1", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": ["P1"],
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: false,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Identity verification must be supported"
      );
    });

    it("should fail validation with identity verification not support for P2", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": ["P2"],
        })
        .withSessionnewClientConfig({
          isIdentityVerificationSupported: false,
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(1);
      expect(errorsArray[0].text[0]).toBe(
        "Identity verification must be supported"
      );
    });

    it("should fail validation with identity verification not set", async () => {
      const req = new RequestBuilder()
        .withBody({
          "selected-locs": ["P1", "P2"],
        })
        .build();

      const result = await selectLevelOfConfidenceFieldValidator.validate(req);

      expect(result.isValid).toBe(false);

      const errorsArray = (result as InvalidField).errors;

      expect(errorsArray).length(1);
      expect(errorsArray[0].text).length(2);
      expect(errorsArray[0].text[0]).toBe(
        "Identity verification must be supported"
      );
    });
  });
});
