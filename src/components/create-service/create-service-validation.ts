import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../types.js";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";

export function validateServiceRequest(): ValidationChainFunc {
  return [
    validateServiceName({
      required: "Enter your service name",
      asciiOnly: "Your service name must only use ASCII characters",
    }),
    validateServiceDescription({
      maxLength: "Your service description must be less than 256 characters",
      asciiOnly: "Your service description must only use ASCII characters",
    }),
    validateBodyMiddleware("create-service/index.njk"),
  ];
}

function validateServiceName(validationMessages: {
  required: string;
  asciiOnly: string;
}): ValidationChain {
  return body("name")
    .trim()
    .notEmpty()
    .withMessage(validationMessages.required)
    .isAscii()
    .withMessage(validationMessages.asciiOnly);
}

function validateServiceDescription(validationMessages: {
  maxLength: string;
  asciiOnly: string;
}): ValidationChain {
  return body("description")
    .isLength({ max: 256 })
    .withMessage(validationMessages.maxLength)
    .if(body("description").notEmpty())
    .isAscii()
    .withMessage(validationMessages.asciiOnly);
}
