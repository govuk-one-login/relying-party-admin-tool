import type { Request } from "express";
import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import {
  clientAuthenticationMethodSummaryFieldValidator,
  clientNameSummaryFieldValidator,
  clientSecretSummaryFieldValidator,
  jwksUrlSummaryFieldValidator,
  publicKeySummaryFieldValidator,
  redirectUrlsSummaryFieldValidator,
  scopesSummaryFieldValidator,
  tokenAuthenticationMethodSummaryFieldValidator,
} from "../../../validation/create-client-summary-field-validators.js";

export function validateCreateClientRequest(): ValidationChainFunc {
  return [
    validateFieldsMiddleware(
      "create-client/summary/index.njk",
      summaryFieldValidators,
      postValidationLocals
    ),
  ];
}

const summaryFieldValidators = clientNameSummaryFieldValidator
  .and(clientAuthenticationMethodSummaryFieldValidator)
  .and(jwksUrlSummaryFieldValidator)
  .and(publicKeySummaryFieldValidator)
  .and(clientSecretSummaryFieldValidator)
  .and(tokenAuthenticationMethodSummaryFieldValidator)
  .and(redirectUrlsSummaryFieldValidator)
  .and(scopesSummaryFieldValidator);

const postValidationLocals = (req: Request): Record<string, unknown> => {
  return { client: req.session.newClientConfig };
};
