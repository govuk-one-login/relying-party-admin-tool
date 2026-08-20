import { ValidationChainFunc } from "../../types.js";
import { validateFieldsMiddleware } from "../../middleware/form-validation-middleware.js";
import { enterServiceNameFieldValidator } from "../../validation/service-validators.js";

export const validateServiceRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-service/index.njk",
      enterServiceNameFieldValidator
    ),
  ];
};
