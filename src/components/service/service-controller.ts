import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";

export const serviceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    if (
      await permissionsService.checkUserHasReaderPermissions("user", "service")
    ) {
      const hasIntegrationWriterPermissions: boolean =
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          "service",
          ClientEnvironment.INTEGRATION
        );
      const hasProductionWriterPermissions: boolean =
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          "service",
          ClientEnvironment.PRODUCTION
        );
      return res.render("service/index.njk", {
        hasIntegrationWriterPermissions,
        hasProductionWriterPermissions,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
