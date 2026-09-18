import { NextFunction, Request, Response } from "express";
import { permissionsService } from "../services/permissions-service.js";
import {
  checkIntegrationWriterPermissionsMiddleware,
  checkReaderPermissionsMiddleware,
} from "./permissions-check-middleware.js";

describe("check-permissions-middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {
        serviceId: "test-service-id",
      },
      log: {
        debug: vi.fn(() => {}),
        info: vi.fn(() => {}),
        warn: vi.fn(() => {}),
        error: vi.fn(() => {}),
      },
    } as unknown as Request;
    res = { redirect: vi.fn(() => {}) };
    next = vi.fn(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkIntegrationWriterPermissionsMiddleware", () => {
    it("should validate user", async () => {
      vi.spyOn(
        permissionsService,
        "checkUserHasWriterPermissions"
      ).mockResolvedValue(true);

      await checkIntegrationWriterPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should redirect to 403 if user permissions check fails", async () => {
      vi.spyOn(
        permissionsService,
        "checkUserHasWriterPermissions"
      ).mockResolvedValue(false);

      await checkIntegrationWriterPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).toHaveBeenCalledWith("/forbidden");
    });

    it("should redirect to 500 if user permissions database call fails", async () => {
      vi.spyOn(permissionsService, "checkUserHasWriterPermissions").mockThrow(
        "test-database-fail"
      );

      await checkIntegrationWriterPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).toHaveBeenCalledWith("/error");
    });
  });

  describe("checkReaderPermissionsMiddleware", () => {
    it("should validate user", async () => {
      vi.spyOn(
        permissionsService,
        "checkUserHasReaderPermissions"
      ).mockResolvedValue(true);

      await checkReaderPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should redirect to 403 if user permissions check fails", async () => {
      vi.spyOn(
        permissionsService,
        "checkUserHasReaderPermissions"
      ).mockResolvedValue(false);

      await checkReaderPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).toHaveBeenCalledWith("/forbidden");
    });

    it("should redirect to 500 if user permissions database call fails", async () => {
      vi.spyOn(permissionsService, "checkUserHasReaderPermissions").mockThrow(
        "test-database-fail"
      );

      await checkReaderPermissionsMiddleware(
        req as Request,
        res as Response,
        next
      );

      expect(res.redirect).toHaveBeenCalledWith("/error");
    });
  });
});
