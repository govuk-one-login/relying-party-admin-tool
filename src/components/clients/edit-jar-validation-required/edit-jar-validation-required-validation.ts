import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { jarValidationRequiredFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditJarValidationRequiredRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-jar-validation-required/index.njk",
        jarValidationRequiredFieldValidator
      ),
    ];
  };
