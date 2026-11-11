import type { NextFunction, Request, Response } from "express";
import { permissionsService } from "../services/permissions-service.js";
import { ClientEnvironment } from "../models/client-environment.js";
import { PATH_NAMES } from "../app.constants.js";
import { Result } from "../models/result.js";

export const checkIntegrationWriterPermissionsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const serviceId = req.params.serviceId as string;
  const userId = "userId";

  const permissionCheckResult = await Result.tryAsync(() =>
    permissionsService.checkUserHasWriterPermissions(
      userId,
      serviceId,
      ClientEnvironment.INTEGRATION
    )
  );

  if (!permissionCheckResult.success) {
    req.log.error(permissionCheckResult.error.message);
    return res.redirect(PATH_NAMES["500_ERROR"]);
  }

  const isPermitted = permissionCheckResult.value;

  if (!isPermitted) {
    req.log.warn(
      {
        serviceId,
      },
      "User does not have permissions to write to integration client"
    );
    return res.redirect(PATH_NAMES["403_ERROR"]);
  }
  next();
};

export const checkReaderPermissionsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const serviceId = req.params.serviceId as string;
  const userId = "userId";
  try {
    if (
      await permissionsService.checkUserHasReaderPermissions(userId, serviceId)
    ) {
      next();
    } else {
      req.log.warn(
        {
          serviceId,
        },
        "User does not have permissions to read to service"
      );
      return res.redirect(PATH_NAMES["403_ERROR"]);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error checking user's reader permissions";
    req.log.error(errorMessage);
    return res.redirect(PATH_NAMES["500_ERROR"]);
  }
};
