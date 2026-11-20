import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { supportIdentityVerificationFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateCreateClientIsIdentityVerificationSupportedRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/support-identity-verification/support-identity-verification/index.njk",
        supportIdentityVerificationFieldValidator
      ),
    ];
  };

export const validateCreateClientEditIsIdentityVerificationSupportedRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/support-identity-verification/edit-support-identity-verification/index.njk",
        supportIdentityVerificationFieldValidator
      ),
    ];
  };
