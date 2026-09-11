import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";
import path from "path";
import { ClientEnvironment } from "../../models/client-environment.js";
import { getClientsByServiceId } from "../../datastores/services-data-store.js";

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

      try {
        const service = {
          serviceId,
          name: "service name",
        };

        const allClients = await getClientsByServiceId(serviceId);

        const productionClient = allClients.filter(
          (client) => client.env === "production"
        )[0];
        const integrationClients = allClients.filter(
          (client) => client.env === "integration"
        );

        return res.render("service/index.njk", {
          hasIntegrationWriterPermissions,
          ...(hasManagerPermissions && { sideNavItems }),
          service,
          productionClient,
          ...(integrationClients.length > 0 && { integrationClients }),
        });
      } catch {
        res.redirect(PATH_NAMES["500_ERROR"]);
      }
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
