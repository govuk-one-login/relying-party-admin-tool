import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../types.js";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";

export function validateServiceNameRequest(): ValidationChainFunc {
  return [
    validateServiceName({
      required: "Enter your service name",
      asciiOnly: "Your service name must only use ASCII characters",
    }),
    validateBodyMiddleware("create-service/index.njk"),
  ];
}

function validateServiceName(validationMessageKeys: {
  required: string;
  asciiOnly: string;
}): ValidationChain {
  return body("name")
    .trim()
    .notEmpty()
    .withMessage(validationMessageKeys.required)
    .isAscii()
    .withMessage(validationMessageKeys.asciiOnly);
}
