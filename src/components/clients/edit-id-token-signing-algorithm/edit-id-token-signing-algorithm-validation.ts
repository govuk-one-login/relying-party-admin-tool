import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { idTokenSigningAlgorithmFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditIdTokenSigningAlgorithmRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-id-token-signing-algorithm/index.njk",
        idTokenSigningAlgorithmFieldValidator
      ),
    ];
  };
