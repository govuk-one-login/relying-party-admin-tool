import { csrfMiddleware } from "./csrf-middleware.js";
import { NextFunction } from "express";

describe("CSRF middleware", () => {
  it("should add csrf token to request locals", () => {
    const csrfToken = "a-csrf-token";
    const csrfTokenStub = vi.fn().mockReturnValue(csrfToken);
    const req: any = { csrfToken: csrfTokenStub };
    const res: any = { locals: {} };
    const nextFunction: NextFunction = vi.fn(() => {});

    csrfMiddleware(req, res, nextFunction);

    expect(csrfTokenStub).toHaveBeenCalledTimes(1);
    expect(res.locals.csrfToken).toBe(csrfToken);
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
});
