import type { Request } from "express";
import { body, ValidationChain } from "express-validator";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
import {
  PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES,
  PROHIBITED_REDIRECT_URI_SCHEMES,
} from "../../../app.constants.js";

export const validateEnterRedirectUrlsRequest = (): ValidationChainFunc => {
  return [
    validateNewRedirectUrl({
      required: "Enter a redirect URL",
      invalidUrl: "Your redirect URL must be a valid URL",
      alreadyExists: "You have already added this redirect URL",
      invalidQueryParameter:
        "You have entered a redirect URL with an invalid query parameter name",
      invalidScheme: "You have entered a redirect URL with an invalid scheme",
    }),
    validationRedirectUrlsList({
      required: "You must have at least one redirect URL",
    }),
    validateBodyMiddleware(
      "create-client/enter-redirect-urls/index.njk",
      postValidationLocals
    ),
  ];
};

const validateNewRedirectUrl = (validationMessages: {
  required: string;
  invalidUrl: string;
  alreadyExists: string;
  invalidQueryParameter: string;
  invalidScheme: string;
}): ValidationChain => {
  return body("redirect-url-input")
    .if(body("action").equals("add"))
    .trim()
    .notEmpty()
    .withMessage(validationMessages.required)
    .custom((value) => {
      try {
        new URL(value);
      } catch {
        throw new Error(validationMessages.invalidUrl);
      }
      return true;
    })
    .custom((value, { req }) => {
      if (
        req.body["redirect-urls"] !== undefined &&
        req.body["redirect-urls"].includes(value)
      ) {
        throw new Error(validationMessages.alreadyExists);
      }
      return true;
    })
    .custom((value) => {
      const url = new URL(value);

      let valid = true;
      url.searchParams.forEach((_value, key) => {
        if (PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES.includes(key)) {
          valid = false;
        }
      });
      if (!valid) {
        throw new Error(validationMessages.invalidQueryParameter);
      }
      return true;
    })
    .custom((value) => {
      const url = new URL(value);

      const urlScheme = url.protocol.replace(":", "");

      if (PROHIBITED_REDIRECT_URI_SCHEMES.includes(urlScheme)) {
        throw new Error(validationMessages.invalidScheme);
      }
      return true;
    });
};

const validationRedirectUrlsList = (validationMessages: {
  required: string;
}): ValidationChain => {
  // due to how request body works, this will either be a string with the single entry or an array
  // therefore no need to test if it is an empty list as it will fail
  return body("redirect-urls")
    .if(body("action").equals("continue"))
    .notEmpty()
    .withMessage(validationMessages.required);
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
