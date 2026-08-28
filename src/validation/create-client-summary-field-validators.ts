import type { Request } from "express";
import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  redirectUrlValidator,
  validScopesValidator,
} from "./shared-client-validators.js";
import { FieldValidator, rule, when } from "./validator.js";
import {
  limitedValidValuesValidator,
  listValidator,
  notEmptyListValidator,
  requiredValidator,
} from "./shared-validators.js";

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

export const clientNameSummaryFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom(
    (req: Request) => req.session.newClientConfig?.name ?? ""
  ),
  "name"
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
