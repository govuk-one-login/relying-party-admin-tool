import { NextFunction, Request, Response } from "express";
import { csrfErrorHandler } from "./csrf-error-handler.js";
import { PATH_NAMES } from "../app.constants.js";

describe("csrf-error-handler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      log: {
        info: vi.fn(),
      },
    } as unknown as Partial<Request>;
    res = {
      redirect: vi.fn(() => {}),
      headersSent: false,
    };
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("csrfErrorHandler", () => {
    it("should call next when headers already sent", () => {
      res.headersSent = true;
      const error = { code: "EBADCSRFTOKEN" };

      csrfErrorHandler(error, req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should redirect to 403 page when CSRF token is invalid", () => {
      const error = { code: "EBADCSRFTOKEN", message: "invalid csrf token" };

      csrfErrorHandler(error, req as Request, res as Response, next);

      expect((req as any).log.info).toHaveBeenCalledTimes(1);
      expect((req as any).log.info).toHaveBeenCalledWith(
        "Failed CSRF validation, redirecting to 403 page.  Original error: invalid csrf token"
      );
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["403_ERROR"]);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next with error when error code is not EBADCSRFTOKEN", () => {
      const error = { code: "OTHER_ERROR", message: "some other error" };

      csrfErrorHandler(error, req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
      expect((req as any).log.info).not.toHaveBeenCalled();
    });
  });
});
