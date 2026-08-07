import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../../types.js";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";

export function validateEnterLandingPageUrlRequest(): ValidationChainFunc {
  return [
    validateLandingPageUrl({
      invalidUrl: "Your landing page URL must be a valid URL",
    }),
    validateBodyMiddleware("create-client/enter-landing-page-url/index.njk"),
  ];
}

function validateLandingPageUrl(validationMessages: {
  invalidUrl: string;
}): ValidationChain {
  return body("landing-page-url")
    .if(body("landing-page-url").notEmpty())
    .isURL()
    .withMessage(validationMessages.invalidUrl);
}
