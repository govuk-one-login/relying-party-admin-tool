import { NextFunction, Request, Response } from "express";
import {
  validateBodyMiddleware,
  validationErrorFormatter,
} from "./form-validation-middleware.js";

describe("HTML Lang middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = { locals: {} };
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validationErrorFormatter", () => {
    it("should format error message", () => {
      const error = {
        type: "field",
        path: "path",
        location: "body",
        msg: "error message",
      } as any;

      const formattedError = validationErrorFormatter(error);

      expect(formattedError).toStrictEqual({
        text: error.msg,
        href: `#${error.path}`,
      });
    });
  });

  describe("validateBodyMiddleware", () => {
    it("should validate request", () => {
      validateBodyMiddleware("test.html")(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith();
    });

    it("should call next function", () => {
      validateBodyMiddleware("test.html")(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith();
    });
  });
});
