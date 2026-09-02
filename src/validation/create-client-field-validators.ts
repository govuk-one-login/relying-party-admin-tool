import type { Request } from "express";
import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  validClaimsValidator,
  validScopesValidator,
  productionUrlValidator,
  redirectUrlValidator,
} from "./shared-client-validators.js";
import { FieldValidator, optional, rule, when } from "./validator.js";
import {
  notEmptyListValidator,
  requiredValidator,
  validUrlValidator,
} from "./shared-validators.js";
import { getListFromRequestBody } from "../helpers/request-helpers.js";

const clientAuthenticationMethodInputFieldValidator = new FieldValidator(
  requiredValidator("Choose a client authentication method").adaptedFrom(
    (req: Request) => req.body["client-authentication-method"]
  ),
  "client-authentication-method"
);

const clientAuthenticationJwksUrlInputFieldValidator = new FieldValidator(
  when(
    (req: Request) => req.body["client-authentication-method"] === "JWKS",
    requiredValidator("Enter a JWKS endpoint URL")
      .and(jwksUrlValidator)
      .adaptedFrom((req: Request) => req.body["jwks-endpoint"])
  ),
  "jwks-endpoint"
);

const clientAuthenticationPublicKeyInputFieldValidator = new FieldValidator(
  when(
    (req: Request) => req.body["client-authentication-method"] === "STATIC",
    requiredValidator("Enter a public key")
      .and(publicKeyValidator)
      .adaptedFrom((req: Request) => req.body["public-key"])
  ),
  "public-key"
);

// TODO: add more validation for client secret
const clientAuthenticationClientSecretInputFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.body["client-authentication-method"] === "CLIENT_SECRET",
    requiredValidator("Enter a client secret").adaptedFrom(
      (req: Request) => req.body["client-secret"]
    )
  ),
  "client-secret"
);

export const clientAuthenticationInputFieldValidatorChain =
  clientAuthenticationMethodInputFieldValidator
    .and(clientAuthenticationJwksUrlInputFieldValidator)
    .and(clientAuthenticationPublicKeyInputFieldValidator)
    .and(clientAuthenticationClientSecretInputFieldValidator);

export const clientNameInputFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom((req: Request) => req.body.name as string),
  "name"
);

export const selectClaimsFieldValidator = new FieldValidator(
  validClaimsValidator
    .adaptedFrom((req: Request) =>
      getListFromRequestBody(req, "selected-claims")
    )
    .and(
      when(
        (req: Request) =>
          req.session.newClientData?.isIdentityVerificationSupported ?? false,
        notEmptyListValidator(
          "Claims cannot be empty when identity verification is supported"
        ).adaptedFrom((req: Request) =>
          getListFromRequestBody(req, "selected-claims")
        )
      )
    ),
  "selected-claims"
);

export const supportIdentityVerificationFieldValidator = new FieldValidator(
  requiredValidator("Choose an option to support identity verification or not")
    .adaptedFrom((req: Request) => req.body["support-identity-verification"])
    .and(
      when(
        (req: Request) =>
          req.session.newClientData?.clientAuthenticationMethod ===
          "CLIENT_SECRET",
        rule(
          (input: string) => input !== "true",
          "Identity verification cannot be supported if client secret is used as authentication method"
        ).adaptedFrom(
          (req: Request) => req.body["support-identity-verification"]
        )
      )
    ),
  "support-identity-verification"
);

export const enterLandingPageUrlFieldValidator = new FieldValidator(
  optional(
    validUrlValidator("landing page URL").and(
      productionUrlValidator("landing page URL")
    )
  ).adaptedFrom((req: Request) => req.body["landing-page-url"] as string),
  "landing-page-url"
);

const enterRedirectUrlInputValidator = when(
  (req: Request) => req.body.action === "add",
  redirectUrlValidator
    .adaptedFrom((req: Request) => req.body["redirect-url-input"])
    .and(
      rule((req: Request) => {
        if (
          req.body["redirect-urls"] !== undefined &&
          req.body["redirect-urls"].includes(req.body["redirect-url-input"])
        ) {
          return false;
        }
        return true;
      }, "You have already added this redirect URL")
    )
);

const enterRedirectUrlTableValidator = when(
  (req: Request) => req.body.action === "continue",
  requiredValidator("You must have at least one redirect URL").adaptedFrom(
    (req: Request) => req.body["redirect-urls"]
  )
);

export const enterRedirectUrlsFieldValidator = new FieldValidator(
  enterRedirectUrlInputValidator.and(enterRedirectUrlTableValidator),
  "redirect-url-input"
);

export const selectScopesFieldValidator = new FieldValidator(
  validScopesValidator.adaptedFrom((req: Request) =>
    getListFromRequestBody(req, "selected-scopes")
  ),
  "selected-scopes"
);
