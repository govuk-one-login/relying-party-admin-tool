import type { Request } from "express";
import crypto from "crypto";
import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../../types.js";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";

export function validateSelectClientAuthenticationRequest(): ValidationChainFunc {
  return [
    validateClientAuthentication({
      required: "Choose a token authentication method",
    }),
    validateJWKSEndpoint({
      required: "Enter a JWKS endpoint URL",
      invalidUrl: "Please enter a valid URL",
    }),
    validatePublicKey({
      required: "Enter a public key",
      validPEMKey: "Please enter a valid PEM key",
    }),
    validateClientSecret({
      required: "Enter a client secret",
    }),
    validateBodyMiddleware(
      "create-client/select-client-authentication/index.njk",
      postValidationLocals
    ),
  ];
}

function validateClientAuthentication(validationMessages: {
  required: string;
}): ValidationChain {
  return body("client-authentication-method")
    .notEmpty()
    .withMessage(validationMessages.required);
}

function validateJWKSEndpoint(validationMessages: {
  required: string;
  invalidUrl: string;
}): ValidationChain {
  return body("jwks-endpoint")
    .if(body("client-authentication-method").equals("JWKS"))
    .notEmpty()
    .withMessage(validationMessages.required)
    .isURL()
    .withMessage(validationMessages.invalidUrl);
}

function validatePublicKey(validationMessages: {
  required: string;
  validPEMKey: string;
}): ValidationChain {
  return body("public-key")
    .if(body("client-authentication-method").equals("STATIC"))
    .notEmpty()
    .withMessage(validationMessages.required)
    .custom((value) => {
      try {
        crypto.createPublicKey(value);
        return true;
      } catch {
        throw new Error(validationMessages.validPEMKey);
      }
    });
}

function validateClientSecret(validationMessages: {
  required: string;
}): ValidationChain {
  return body("client-secret")
    .if(body("client-authentication-method").equals("CLIENT_SECRET"))
    .notEmpty()
    .withMessage(validationMessages.required); // TODO: add more client secret validation
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  return {
    clientAuthenticationMethod:
      req.body && req.body["client-authentication-method"]
        ? req.body["client-authentication-method"]
        : undefined,
  };
};
