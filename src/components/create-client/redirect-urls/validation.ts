import type { Request } from "express";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { redirectUrlsFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEnterRedirectUrlsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/redirect-urls/enter-redirect-urls/index.njk",
      redirectUrlsFieldValidator,
      postValidationLocals
    ),
  ];
};

export const validateEditRedirectUrlsRequest = (): ValidationChainFunc => {
  return [
    validateFieldsMiddleware(
      "create-client/redirect-urls/edit-redirect-urls/index.njk",
      redirectUrlsFieldValidator,
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
