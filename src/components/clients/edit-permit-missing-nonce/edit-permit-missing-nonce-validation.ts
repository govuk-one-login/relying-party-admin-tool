import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { permitMissingNonceFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditPermitMissingNonceRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-permit-missing-nonce/index.njk",
        permitMissingNonceFieldValidator
      ),
    ];
  };
