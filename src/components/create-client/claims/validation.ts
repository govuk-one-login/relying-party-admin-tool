import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { claimsFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateSelectClaimsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/claims/select-claims/index.njk",
      claimsFieldValidator
    ),
  ];
};

export const validateEditClaimsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/claims/edit-claims/index.njk",
      claimsFieldValidator
    ),
  ];
};
