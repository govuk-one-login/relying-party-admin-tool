import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { scopesFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateCreateClientSelectScopesRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/scopes/select-scopes/index.njk",
        scopesFieldValidator
      ),
    ];
  };

export const validateCreateClientEditScopesRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/scopes/edit-scopes/index.njk",
        scopesFieldValidator
      ),
    ];
  };
