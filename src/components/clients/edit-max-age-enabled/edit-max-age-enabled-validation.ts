import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { maxAgeEnabledFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditMaxAgeEnabledRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-max-age-enabled/index.njk",
      maxAgeEnabledFieldValidator
    ),
  ];
};
