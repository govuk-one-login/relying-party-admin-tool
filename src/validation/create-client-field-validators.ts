import type { Request } from "express";
import {
  clientNameValidator,
  validClaimsValidator,
  validScopesValidator,
  validRedirectURLQueryParamsValidator,
  validRedirectURLURISchemeValidator,
} from "./shared-client-validators.js";
import { FieldValidator, optional, rule, when } from "./validator.js";
import {
  notEmptyListValidator,
  notHttpValidator,
  notLocalhostValidator,
  requiredValidator,
  validUrlValidator,
} from "./shared-validators.js";
import { getListFromRequestBody } from "../helpers/request-helpers.js";
import { isProductionEnv } from "../config.js";

export const enterClientNameFieldValidator = new FieldValidator(
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
      when(
        isProductionEnv,
        notHttpValidator("landing page URL").and(
          notLocalhostValidator("landing page URL")
        )
      )
    )
  ).adaptedFrom((req: Request) => req.body["landing-page-url"] as string),
  "landing-page-url"
);

const enterRedirectUrlInputValidator = when(
  (req: Request) => req.body.action === "add",
  requiredValidator("Enter a redirect URL")
    .adaptedFrom((req: Request) => req.body["redirect-url-input"])
    .and(
      validUrlValidator("redirect URL").adaptedFrom(
        (req: Request) => req.body["redirect-url-input"]
      )
    )
    .and(
      when(
        isProductionEnv,
        notHttpValidator("redirect URL")
          .adaptedFrom((req: Request) => req.body["redirect-url-input"])
          .and(
            notLocalhostValidator("redirect URL").adaptedFrom(
              (req: Request) => req.body["redirect-url-input"]
            )
          )
      )
    )
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
    .and(
      validRedirectURLQueryParamsValidator(
        "You have entered a redirect URL with an invalid query parameter name"
      ).adaptedFrom((req: Request) => req.body["redirect-url-input"])
    )
    .and(
      validRedirectURLURISchemeValidator(
        "You have entered a redirect URL with an invalid scheme"
      ).adaptedFrom((req: Request) => req.body["redirect-url-input"])
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
