import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { pkceEnforcedFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditPKCEEnforcedRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-pkce-enforced/index.njk",
      pkceEnforcedFieldValidator
    ),
  ];
};
