import type { Request } from "express";
import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  redirectUrlValidator,
  validClaimsValidator,
  validLevelOfConfidenceValidator,
  validScopesValidator,
} from "./shared-client-validators.js";
import { FieldValidator, optional, rule, when } from "./validator.js";
import {
  limitedValidValuesValidator,
  listValidator,
  notEmptyListValidator,
  productionUrlValidator,
  requiredValidator,
  validUrlValidator,
} from "./shared-validators.js";
import { getOptionalList } from "../helpers/request-helpers.js";

export const clientAuthenticationMethodSummaryFieldValidator =
  new FieldValidator(
    requiredValidator("You must set a client authentication method")
      .and(
        limitedValidValuesValidator(
          ["JWKS", "STATIC", "CLIENT_SECRET"],
          "client authentication method"
        )
      )
      .adaptedFrom(
        (req: Request) =>
          req.session.newClientConfig?.clientAuthenticationMethod ?? ""
      ),
    "client-authentication-method"
  );

export const jwksUrlSummaryFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.session.newClientConfig?.clientAuthenticationMethod === "JWKS",
    requiredValidator("Enter a JWKS endpoint URL")
      .and(jwksUrlValidator)
      .adaptedFrom((req: Request) => req.session.newClientConfig?.jwksURL ?? "")
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientConfig?.clientTokenAuthenticationMethod !==
            "private_key_jwt"
          ) {
            return false;
          }
          return true;
        }, "Token authentication method must be private_key_jwt if client authentication method is a JWKS URL")
      )
  ),
  "jwks-endpoint"
);

export const publicKeySummaryFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.session.newClientConfig?.clientAuthenticationMethod === "STATIC",
    requiredValidator("Enter a public key")
      .and(publicKeyValidator)
      .adaptedFrom(
        (req: Request) => req.session.newClientConfig?.publicKey ?? ""
      )
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientConfig?.clientTokenAuthenticationMethod !==
            "private_key_jwt"
          ) {
            return false;
          }
          return true;
        }, "Token authentication method must be private_key_jwt if client authentication method is a public key")
      )
  ),
  "public-key"
);

// TODO: add more validation for client secret
export const clientSecretSummaryFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.session.newClientConfig?.clientAuthenticationMethod ===
      "CLIENT_SECRET",
    requiredValidator("Enter a client secret")
      .adaptedFrom(
        (req: Request) => req.session.newClientConfig?.clientSecret ?? ""
      )
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientConfig?.clientTokenAuthenticationMethod !==
            "client_secret_post"
          ) {
            return false;
          }
          return true;
        }, "Token authentication method must be client_secret_post if client authentication method is client secret")
      )
  ),
  "client-secret"
);

export const claimsFieldValidator = new FieldValidator(
  validClaimsValidator.adaptedFrom((req: Request) =>
    getOptionalList(req.session.newClientConfig?.claims)
  ),
  "claims"
);

export const clientNameSummaryFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom(
    (req: Request) => req.session.newClientConfig?.clientName ?? ""
  ),
  "client-name"
);

export const supportIdentityVerificationFieldValidator = new FieldValidator(
  requiredValidator("Choose an option to support identity verification or not")
    .adaptedFrom((req: Request) =>
      req.session.newClientConfig?.isIdentityVerificationSupported
        ? req.session.newClientConfig?.isIdentityVerificationSupported?.toString()
        : ""
    )
    .and(
      when(
        (req: Request) =>
          req.session.newClientConfig?.clientAuthenticationMethod ===
          "CLIENT_SECRET",
        rule(
          (input?: string) => input !== "true",
          "Identity verification cannot be supported if client secret is used as authentication method"
        ).adaptedFrom((req: Request) =>
          req.session.newClientConfig?.isIdentityVerificationSupported
            ? req.session.newClientConfig?.isIdentityVerificationSupported?.toString()
            : ""
        )
      )
    ),
  "support-identity-verification"
);

export const landingPageUrlFieldValidator = new FieldValidator(
  optional(
    validUrlValidator("landing page URL").and(
      productionUrlValidator("landing page URL")
    )
  ).adaptedFrom(
    (req: Request) => req.session.newClientConfig?.landingPageUrl as string
  ),
  "landing-page-url"
);

export const levelOfConfidenceFieldValidator = new FieldValidator(
  validLevelOfConfidenceValidator
    .adaptedFrom((req: Request) =>
      getOptionalList(req.session.newClientConfig?.loc)
    )
    .and(
      when(
        (req: Request) =>
          req.session.newClientConfig?.isIdentityVerificationSupported !== true,
        rule(
          (value: string[]) => !value.includes("P1"),
          "Identity verification must be supported"
        )
          .and(
            rule(
              (value: string[]) => !value.includes("P2"),
              "Identity verification must be supported"
            )
          )
          .adaptedFrom((req: Request) =>
            getOptionalList(req.session.newClientConfig?.loc)
          )
      )
    ),
  "level-of-confidence"
);

export const redirectUrlsSummaryFieldValidator = new FieldValidator(
  notEmptyListValidator("You must have at least one redirect URL")
    .and(listValidator(redirectUrlValidator))
    .adaptedFrom(
      (req: Request) => req.session.newClientConfig?.redirectUrls ?? []
    ),
  "redirect-urls"
);

export const scopesSummaryFieldValidator = new FieldValidator(
  validScopesValidator
    .and(
      rule(
        (scopes: string[]) => scopes.includes("openid"),
        'Scopes must contain "openid"'
      )
    )
    .adaptedFrom((req: Request) => req.session.newClientConfig?.scopes ?? []),
  "scopes"
);

export const tokenAuthenticationMethodSummaryFieldValidator =
  new FieldValidator(
    rule((req: Request) => {
      if (
        req.session.newClientConfig?.clientAuthenticationMethod === "STATIC" &&
        req.session.newClientConfig?.clientTokenAuthenticationMethod !==
          "private_key_jwt"
      ) {
        return false;
      }
      return true;
    }, "Token authentication method must be private_key_jwt if client authentication method is a public key").and(
      rule((req: Request) => {
        if (
          req.session.newClientConfig?.clientAuthenticationMethod ===
            "CLIENT_SECRET" &&
          req.session.newClientConfig?.clientTokenAuthenticationMethod !==
            "client_secret_post"
        ) {
          return false;
        }
        return true;
      }, "Token authentication method must be client_secret_post if client authentication method is client secret")
    ),
    "token-authentication-method"
  );
