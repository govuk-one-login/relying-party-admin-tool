import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { supportIdentityVerificationFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditIsIdentityVerificationSupportedRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-support-identity-verification/index.njk",
        supportIdentityVerificationFieldValidator
      ),
    ];
  };
