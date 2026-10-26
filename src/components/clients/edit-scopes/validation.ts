import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { allScopesFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditScopesRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-scopes/index.njk",
      allScopesFieldValidator
    ),
  ];
};
