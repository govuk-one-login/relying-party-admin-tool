import type { Request } from "express";
import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import {
  clientNameSummaryFieldValidator,
  redirectUrlsSummaryFieldValidator,
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

const summaryFieldValidators = clientNameSummaryFieldValidator.and(
  redirectUrlsSummaryFieldValidator
);

const postValidationLocals = (req: Request): Record<string, unknown> => {
  return { client: req.session.newClientData };
};
