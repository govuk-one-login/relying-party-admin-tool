import type { NextFunction, Request, Response } from "express";
import { ValidationFunction } from "../types.js";
import { renderBadRequest } from "../utils/validation.js";
import {
  FieldValidator,
  FieldValidatorChain,
} from "../validation/validator.js";

export const validateFieldsMiddleware = (
  template: string,
  validator: FieldValidator<Request> | FieldValidatorChain<Request>,
  postValidationLocals?: (req: Request) => Record<string, unknown>
): ValidationFunction => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const result = await validator.validate(req);

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;

    if (!result.isValid) {
      return renderBadRequest(res, req, template, result.errors, locals);
    }
    next();
  };
};
