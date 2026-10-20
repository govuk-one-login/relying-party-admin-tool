import { NextFunction, Request, Response } from "express";
import { noCacheMiddleware } from "./no-cache-middleware.js";

describe("no-cache-middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Partial<Request>;
    res = {
      set: vi.fn(),
    };
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("noCacheMiddleware", () => {
    it("should set Cache-Control header with no-cache directives", () => {
      noCacheMiddleware(req as Request, res as Response, next);

      expect(res.set).toHaveBeenCalledExactlyOnceWith(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      expect(next).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
