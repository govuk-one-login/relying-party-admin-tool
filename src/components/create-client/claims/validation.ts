import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { claimsFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateCreateClientSelectClaimsRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/claims/select-claims/index.njk",
        claimsFieldValidator
      ),
    ];
  };

export const validateCreateClientEditClaimsRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/claims/edit-claims/index.njk",
        claimsFieldValidator
      ),
    ];
  };
