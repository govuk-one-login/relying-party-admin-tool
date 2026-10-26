import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { clientNameInputFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditClientNameRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-client-name/index.njk",
      clientNameInputFieldValidator
    ),
  ];
};
