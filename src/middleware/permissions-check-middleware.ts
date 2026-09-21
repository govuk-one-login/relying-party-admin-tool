import type { NextFunction, Request, Response } from "express";
import { permissionsService } from "../services/permissions-service.js";
import { ClientEnvironment } from "../models/client-environment.js";
import { PATH_NAMES } from "../app.constants.js";

export const checkIntegrationWriterPermissionsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const serviceId = req.params.serviceId as string;
  const userId = "userId";
  try {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        userId,
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      next();
    } else {
      req.log.warn(
        {
          serviceId,
        },
        "User does not have permissions to write to integration client"
      );
      return res.redirect(PATH_NAMES["403_ERROR"]);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error checking user's integration writer permissions";
    req.log.error(errorMessage);
    return res.redirect(PATH_NAMES["500_ERROR"]);
  }
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
