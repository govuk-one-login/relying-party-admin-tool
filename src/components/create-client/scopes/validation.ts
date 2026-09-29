import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { scopesFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateSelectScopesRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/scopes/select-scopes/index.njk",
      scopesFieldValidator
    ),
  ];
};

export const validateEditScopesRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/scopes/edit-scopes/index.njk",
      scopesFieldValidator
    ),
  ];
};
