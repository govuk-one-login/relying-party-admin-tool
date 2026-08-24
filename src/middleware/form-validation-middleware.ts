import type { NextFunction, Request, Response } from "express";
import { renderBadRequest } from "../utils/validation.js";
import {
  FieldValidator,
  FieldValidatorChain,
} from "../validation/validator.js";

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
      return renderBadRequest(res, req, template, result.errors, locals);
    }
    next();
  };
};
