import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { rateLimitFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditRateLimitRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-rate-limit/index.njk",
      rateLimitFieldValidator
    ),
  ];
};
