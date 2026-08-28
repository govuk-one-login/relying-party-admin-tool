import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { isActiveFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditIsActiveRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-is-active/index.njk",
      isActiveFieldValidator
    ),
  ];
};
