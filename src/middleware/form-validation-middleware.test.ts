import { NextFunction, Request, Response } from "express";
import {
  validateBodyMiddleware,
  validateFieldsMiddleware,
  validationErrorFormatter,
} from "./form-validation-middleware.js";
import { FieldValidator, rule } from "../helpers/validator.js";

describe("form validation middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        input: "test",
      },
    };
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

  describe("validateFieldsMiddleware", () => {
    it("should validate request", async () => {
      const testValidator = rule(
        (input: string) => input.includes("test"),
        "String does not contain test"
      ).adaptedFrom((req: Request) => req.body.input);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(testValidator, fieldName);
      const validateSpy = vi.spyOn(fieldValidator, "validate");
      await validateFieldsMiddleware("test.html", fieldValidator)(
        req as Request,
        res as Response,
        next
      );

      expect(validateSpy).toHaveBeenCalledWith(req);
    });

    it("should call next function", async () => {
      const testValidator = rule(
        (input: string) => input.includes("test"),
        "String does not contain test"
      ).adaptedFrom((req: Request) => req.body.input);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(testValidator, fieldName);
      await validateFieldsMiddleware("test.html", fieldValidator)(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith();
    });
  });
});
