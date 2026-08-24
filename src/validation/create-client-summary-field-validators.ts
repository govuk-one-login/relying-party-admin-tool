import type { Request } from "express";
import {
  clientNameValidator,
  jwksUrlValidator,
  publicKeyValidator,
  redirectUrlValidator,
} from "./shared-client-validators.js";
import { FieldValidator, when } from "./validator.js";
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
  ),
  "public-key"
);

// TODO: add more validation for client secret
export const clientSecretSummaryFieldValidator = new FieldValidator(
  when(
    (req: Request) =>
      req.session.newClientData?.clientAuthenticationMethod === "CLIENT_SECRET",
    requiredValidator("Enter a client secret").adaptedFrom(
      (req: Request) => req.session.newClientData?.clientSecret ?? ""
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
