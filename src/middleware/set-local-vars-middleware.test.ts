import { NextFunction, Request, Response } from "express";
import { setLocalVarsMiddleware } from "./set-local-vars-middleware.js";
import * as nonceModule from "../utils/strings.js";

describe("set-local-vars-middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      session: {} as any,
      cookies: {} as any,
      headers: {
        host: "example.com",
      },
      get: function (headerName: string) {
        if (headerName === "host") {
          return "example.com";
        }
      },
    } as Partial<Request>;
    res = {
      status: vi.fn(),
      locals: {},
      redirect: vi.fn(() => {}),
    };
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.APP_ENV;
  });

  describe("setLocalVarsMiddleware", () => {
    it("should add script none", async () => {
      const mockNonce = "mocked-nonce-value";
      vi.spyOn(nonceModule, "generateNonce").mockResolvedValue(mockNonce);

      await setLocalVarsMiddleware(req as Request, res as Response, next);

      expect(res.locals?.scriptNonce).toBe(mockNonce);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
