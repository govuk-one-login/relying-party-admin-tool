import type { Request } from "express";
import { ValidationChainFunc } from "../../../types.js";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { clientAuthenticationInputFieldValidatorChain } from "../../../validation/create-client-field-validators.js";

export const validateSelectClientAuthenticationRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "create-client/client-authentication-method/select-client-authentication-method/index.njk",
        clientAuthenticationInputFieldValidatorChain,
        postValidationLocals
      ),
    ];
  };

const postValidationLocals = (req: Request): Record<string, unknown> => {
  return {
    clientAuthenticationMethod:
      req.body && req.body["client-authentication-method"]
        ? req.body["client-authentication-method"]
        : undefined,
  };
};
