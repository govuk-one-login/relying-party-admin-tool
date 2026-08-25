import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { enterClientNameFieldValidator } from "../../../validation/create-client-field-validators.js";

export const validateEnterClientNameRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/client-name/enter-client-name/index.njk",
      enterClientNameFieldValidator
    ),
  ];
};
