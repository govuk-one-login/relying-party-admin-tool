import type { Request } from "express";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { enterRedirectUrlsFieldValidator } from "../../../validation/create-client-field-validators.js";

export const validateEnterRedirectUrlsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/enter-redirect-urls/index.njk",
      enterRedirectUrlsFieldValidator,
      postValidationLocals
    ),
  ];
};

const postValidationLocals = (req: Request): Record<string, unknown> => {
  let redirectUrls: string[] = [];
  if (req.body && req.body["redirect-urls"]) {
    redirectUrls = Array.isArray(req.body["redirect-urls"])
      ? req.body["redirect-urls"]
      : [req.body["redirect-urls"]];
  }
  return {
    redirectUrls,
  };
};
