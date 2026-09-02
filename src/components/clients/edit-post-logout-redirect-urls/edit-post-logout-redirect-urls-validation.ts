import type { Request } from "express";
import { validateFieldsMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import { postLogoutRedirectUrlsFieldValidator } from "../../../validation/client-question-field-validators.js";

export const validateEditPostLogoutRedirectUrlsRequest =
  (): ValidationChainFunc => {
    return [
      validateFieldsMiddleware(
        "clients/edit-post-logout-redirect-urls/index.njk",
        postLogoutRedirectUrlsFieldValidator,
        postValidationLocals
      ),
    ];
  };

const postValidationLocals = (req: Request): Record<string, unknown> => {
  let postLogoutRedirectUrls: string[] = [];
  if (req.body && req.body["post-logout-redirect-urls"]) {
    postLogoutRedirectUrls = Array.isArray(
      req.body["post-logout-redirect-urls"]
    )
      ? req.body["post-logout-redirect-urls"]
      : [req.body["post-logout-redirect-urls"]];
  }
  return {
    postLogoutRedirectUrls,
  };
};
