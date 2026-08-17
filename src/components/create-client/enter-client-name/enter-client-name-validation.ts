import type { Request } from "express";
import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { clientNameValidator } from "../../../helpers/shared-client-validator.js";
import { FieldValidator } from "../../../helpers/validator.js";

export const validateEnterClientNameRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/enter-client-name/index.njk",
      enterClientNameFieldValidator
    ),
  ];
};

export const enterClientNameFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom((req: Request) => req.body.name as string),
  "name"
);
