import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../types.js";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";

export function validateServiceRequest(): ValidationChainFunc {
  return [
    validateServiceName({
      required: "Enter your service name",
      asciiOnly: "Your service name must only use ASCII characters",
      maxLength: "Your service name must be less than 256 characters long",
    }),
    validateServiceDescription({
      asciiOnly: "Your service description must only use ASCII characters",
    }),
    validateBodyMiddleware("create-service/index.njk"),
  ];
}

function validateServiceName(validationMessages: {
  required: string;
  asciiOnly: string;
  maxLength: string;
}): ValidationChain {
  return body("name")
    .trim()
    .notEmpty()
    .withMessage(validationMessages.required)
    .isAscii()
    .withMessage(validationMessages.asciiOnly)
    .isLength({ max: 256 })
    .withMessage(validationMessages.maxLength);
}

function validateServiceDescription(validationMessages: {
  asciiOnly: string;
}): ValidationChain {
  return body("description")
    .if(body("description").notEmpty())
    .isAscii()
    .withMessage(validationMessages.asciiOnly);
}
