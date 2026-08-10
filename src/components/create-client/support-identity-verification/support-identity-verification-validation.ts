import type { Request } from "express";
import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../../types.js";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";

export const validateIsIdentityVerificationSupportedRequest =
  (): ValidationChainFunc => {
    return [
      validateIsIdentityVerificationSupported({
        required: "Choose an option to support identity verification or not",
      }),
      validateBodyMiddleware(
        "create-client/support-identity-verification/index.njk",
        postValidationLocals
      ),
    ];
  };

const validateIsIdentityVerificationSupported = (validationMessages: {
  required: string;
}): ValidationChain => {
  return body("support-identity-verification")
    .notEmpty()
    .withMessage(validationMessages.required);
};

const postValidationLocals = (req: Request): Record<string, unknown> => {
  if (
    req.session.newClientData?.clientAuthenticationMethod === "CLIENT_SECRET" &&
    req.body["support-identity-verification"] === "true"
  ) {
    return {
      errors: {
        "support-identity-verification": {
          text: "Identity verification cannot be supported if client secret is used as authentication method",
        },
      },
      errorList: [
        {
          text: "Identity verification cannot be supported if client secret is used as authentication method",
          href: "#support-identity-verification",
        },
      ],
    };
  }
  return {};
};
