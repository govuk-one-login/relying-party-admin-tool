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
  fieldValidator,
  listValidator,
  notEmptyListValidator,
  requiredValidator,
} from "./shared-validators.js";

export const clientAuthenticationMethodSummaryFieldValidator =
  new FieldValidator(
    requiredValidator("You must set a client authentication method")
      .and(
        fieldValidator(
          ["JWKS", "STATIC", "CLIENT_SECRET"],
          "client authentication method"
        )
      )
      .adaptedFrom(
        (req: Request) =>
          req.session.newClientData?.clientAuthenticationMethod ?? ""
      ),
    "client-authentication-method"
  );

export const jwksUrlSummaryFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.session.newClientData?.clientAuthenticationMethod === "JWKS",
    requiredValidator("Enter a JWKS endpoint URL")
      .and(jwksUrlValidator)
      .adaptedFrom((req: Request) => req.session.newClientData?.jwksURL ?? "")
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientData?.clientTokenAuthenticationMethod !==
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
      req.session.newClientData?.clientAuthenticationMethod === "STATIC",
    requiredValidator("Enter a public key")
      .and(publicKeyValidator)
      .adaptedFrom((req: Request) => req.session.newClientData?.publicKey ?? "")
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientData?.clientTokenAuthenticationMethod !==
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
      req.session.newClientData?.clientAuthenticationMethod === "CLIENT_SECRET",
    requiredValidator("Enter a client secret")
      .adaptedFrom(
        (req: Request) => req.session.newClientData?.clientSecret ?? ""
      )
      .and(
        rule((req: Request) => {
          if (
            req.session.newClientData?.clientTokenAuthenticationMethod !==
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
    (req: Request) => req.session.newClientData?.name ?? ""
  ),
  "name"
);

export const redirectUrlsSummaryFieldValidator = new FieldValidator(
  notEmptyListValidator("You must have at least one redirect URL")
    .and(listValidator(redirectUrlValidator))
    .adaptedFrom(
      (req: Request) => req.session.newClientData?.redirectUrls ?? []
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
    .adaptedFrom((req: Request) => req.session.newClientData?.scopes ?? []),
  "scopes"
);

export const tokenAuthenticationMethodSummaryFieldValidator =
  new FieldValidator(
    rule((req: Request) => {
      if (
        req.session.newClientData?.clientAuthenticationMethod === "STATIC" &&
        req.session.newClientData?.clientTokenAuthenticationMethod !==
          "private_key_jwt"
      ) {
        return false;
      }
      return true;
    }, "Token authentication method must be private_key_jwt if client authentication method is a public key").and(
      rule((req: Request) => {
        if (
          req.session.newClientData?.clientAuthenticationMethod ===
            "CLIENT_SECRET" &&
          req.session.newClientData?.clientTokenAuthenticationMethod !==
            "client_secret_post"
        ) {
          return false;
        }
        return true;
      }, "Token authentication method must be client_secret_post if client authentication method is client secret")
    ),
    "token-authentication-method"
  );
