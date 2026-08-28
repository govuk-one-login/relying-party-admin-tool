import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";
import path from "path";
import { ClientEnvironment } from "../../models/client-environment.js";

export const serviceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasReaderPermissions("user", serviceId)
    ) {
      const hasIntegrationWriterPermissions: boolean =
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          serviceId,
          ClientEnvironment.INTEGRATION
        );
      const hasProductionWriterPermissions: boolean =
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          serviceId,
          ClientEnvironment.PRODUCTION
        );
      const hasManagerPermissions =
        await permissionsService.checkUserHasManagerPermissions(
          "user",
          serviceId
        );
      const sideNavItems = [
        {
          active: true,
          text: "Clients",
          href: req.path,
        },
        {
          active: false,
          text: "Team members",
          href: path.posix.join(req.path, "team-members"),
        },
      ];

      return res.render("service/index.njk", {
        hasIntegrationWriterPermissions,
        hasProductionWriterPermissions,
        ...(hasManagerPermissions && { sideNavItems }),
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
