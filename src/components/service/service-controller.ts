import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";
import path from "path";

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
      const hasManagerPermissions =
        await permissionsService.checkUserHasManagerPermissions(
          "user",
          "service"
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
        baseUrl: req.path.replace(/\/$/, ""),
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
