import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { supportIdentityVerificationFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateIsIdentityVerificationSupportedRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/support-identity-verification/index.njk",
        supportIdentityVerificationFieldValidator
      ),
    ];
  };
