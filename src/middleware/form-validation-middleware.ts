import type { NextFunction, Request, Response } from "express";
import {
  validationResult,
  type ErrorFormatter,
  type ValidationError,
} from "express-validator";
import { isObjectEmpty, renderBadRequest } from "../utils/validation.js";

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

export function validateBodyMiddleware(template: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    if (!isObjectEmpty(errors)) {
      return renderBadRequest(res, req, template, errors);
    }
    next();
  };
}
