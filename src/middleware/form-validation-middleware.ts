import type { NextFunction, Request, Response } from "express";
import {
  validationResult,
  type ErrorFormatter,
  type ValidationError,
} from "express-validator";
import {
  isObjectEmpty,
  renderBadRequest,
  renderBadRequestFields,
} from "../utils/validation.js";
import {
  FieldValidator,
  FieldValidatorChain,
} from "../validation/validator.js";

export const validationErrorFormatter: ErrorFormatter = (
  error: ValidationError
) => {
  if (error.type === "field") {
    return {
      text: error.msg,
      href: `#${error.path}`,
    };
  }
  throw new Error(`Unsupported express-validator error type: ${error.type}`);
};

export const validateBodyMiddleware = (
  template: string,
  postValidationLocals?: (req: Request) => Record<string, unknown>
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;

    if (!isObjectEmpty(errors) || locals?.errors !== undefined) {
      return renderBadRequest(res, req, template, errors, locals);
    }
    next();
  };
};

export const validateFieldsMiddleware = (
  template: string,
  validator: FieldValidator<Request> | FieldValidatorChain<Request>,
  postValidationLocals?: (req: Request) => Record<string, unknown>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const result = await validator.validate(req);

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;

    if (!result.isValid) {
      return renderBadRequestFields(res, req, template, result.errors, locals);
    }
    next();
  };
};
