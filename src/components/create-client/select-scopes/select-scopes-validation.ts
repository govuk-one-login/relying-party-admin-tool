import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { selectScopesFieldValidator } from "../../../validation/create-client-field-validators.js";

export const validateSelectScopesRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/select-scopes/index.njk",
      selectScopesFieldValidator
    ),
  ];
};
