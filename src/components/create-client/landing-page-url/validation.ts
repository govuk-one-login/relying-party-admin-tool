import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { landingPageUrlFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEnterLandingPageUrlRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/landing-page-url/enter-landing-page-url/index.njk",
      landingPageUrlFieldValidator
    ),
  ];
};

export const validateEditLandingPageUrlRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/landing-page-url/edit-landing-page-url/index.njk",
      landingPageUrlFieldValidator
    ),
  ];
};
