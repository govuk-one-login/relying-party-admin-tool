import { NextFunction, Request, Response } from "express";
import { sanitizeRequestMiddleware } from "./sanitize-request-middleware.js";

describe("sanitize-request-middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sanitizeRequestMiddleware", () => {
    it("should not change input when no xss present", () => {
      req = {
        body: {
          name: "Test123",
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).toBe("Test123");
      expect(next).toHaveBeenCalledWith();
    });

    it("should remove entire script block returning an empty string", () => {
      req = {
        body: {
          name: "<SCRIPT SRC=http://xss.rocks/xss.js></SCRIPT>",
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).toBe("");
      expect(next).toHaveBeenCalledWith();
    });

    it("should remove entire input returning an empty string", () => {
      req = {
        body: {
          name: '<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">',
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).toBe("");
      expect(next).toHaveBeenCalledWith();
    });

    it("handles multiple fields", () => {
      req = {
        body: {
          name: "Test12",
          email: "test@test.com",
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).toBe("Test12");
      expect(req.body.email).toBe("test@test.com");
      expect(next).toHaveBeenCalledWith();
    });

    it("should trim whitespace from form field", () => {
      req = {
        body: {
          name: "    James Mc'oy \n\t",
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.name).toBe("James Mc'oy");
      expect(next).toHaveBeenCalledWith();
    });

    it("should sanitize arrays", () => {
      req = {
        body: {
          "name-list": [
            '<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">',
            "Test12",
            "Test34",
          ],
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body["name-list"]).toStrictEqual(["Test12", "Test34"]);
      expect(next).toHaveBeenCalledWith();
    });

    it("should sanitize numbers", () => {
      req = {
        body: {
          age: 101,
        },
      } as Request;

      sanitizeRequestMiddleware(req as Request, res as Response, next);

      expect(req.body.age).toBe(101);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
