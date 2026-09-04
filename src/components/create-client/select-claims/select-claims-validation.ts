import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { selectClaimsFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateSelectClaimsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/select-claims/index.njk",
      selectClaimsFieldValidator
    ),
  ];
};
