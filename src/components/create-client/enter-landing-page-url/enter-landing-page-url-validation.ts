import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { enterLandingPageUrlFieldValidator } from "../../../validation/create-client-field-validators.js";

export const validateEnterLandingPageUrlRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/enter-landing-page-url/index.njk",
      enterLandingPageUrlFieldValidator
    ),
  ];
};
