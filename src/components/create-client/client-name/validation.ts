import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { clientNameInputFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEnterClientNameRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/client-name/enter-client-name/index.njk",
      clientNameInputFieldValidator
    ),
  ];
};

export const validateEditClientNameRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/client-name/edit-client-name/index.njk",
      clientNameInputFieldValidator
    ),
  ];
};
