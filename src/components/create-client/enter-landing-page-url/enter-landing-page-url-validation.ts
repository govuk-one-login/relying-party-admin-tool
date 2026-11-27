import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { enterLandingPageUrlFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateCreateClientEnterLandingPageUrlRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/enter-landing-page-url/index.njk",
        enterLandingPageUrlFieldValidator
      ),
    ];
  };
