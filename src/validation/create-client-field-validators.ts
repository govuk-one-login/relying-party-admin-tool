import type { Request } from "express";
import {
  clientNameValidator,
  validClaimsValidator,
  validScopesValidator,
} from "./shared-client-validators.js";
import { FieldValidator, when } from "./validator.js";
import { notEmptyListValidator } from "./shared-validators.js";
import { getListFromRequestBody } from "../helpers/request-helpers.js";

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

export const selectScopesFieldValidator = new FieldValidator(
  validScopesValidator.adaptedFrom((req: Request) =>
    getListFromRequestBody(req, "selected-scopes")
  ),
  "selected-scopes"
);
