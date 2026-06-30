import { body, ValidationChain } from "express-validator";
import { ValidationChainFunc } from "../../../types.js";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";

export function validateEnterClientNameRequest(): ValidationChainFunc {
  const tmp = validateClientName({
    required: "Enter your client name",
    maxLength: "Your client name must be less than 255 characters long",
    asciiOnly: "Your client name must only use ASCII characters",
    startsWithColon: "Your client name cannot start with ':'",
  });
  console.log(tmp);
  return [
    validateClientName({
      required: "Enter your client name",
      maxLength: "Your client name must be less than 255 characters long",
      asciiOnly: "Your client name must only use ASCII characters",
      startsWithColon: "Your client name cannot start with ':'",
    }),
    validateBodyMiddleware("create-client/enter-client-name/index.njk"),
  ];
}

function validateClientName(validationMessages: {
  required: string;
  maxLength: string;
  asciiOnly: string;
  startsWithColon: string;
}): ValidationChain {
  return body("name")
    .trim()
    .notEmpty()
    .withMessage(validationMessages.required)
    .isLength({ max: 254 })
    .withMessage(validationMessages.maxLength)
    .isAscii()
    .withMessage(validationMessages.asciiOnly)
    .custom((value) => {
      if (value.startsWith(":")) {
        throw new Error(validationMessages.startsWithColon);
      }
      return true;
    });
}
