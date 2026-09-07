import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { serviceTypeFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditServiceTypeRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "clients/edit-service-type/index.njk",
      serviceTypeFieldValidator
    ),
  ];
};
