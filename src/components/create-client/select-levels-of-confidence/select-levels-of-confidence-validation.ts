import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { selectLevelOfConfidenceFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateSelectLevelsOfConfidenceRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/select-levels-of-confidence/index.njk",
      selectLevelOfConfidenceFieldValidator
    ),
  ];
};