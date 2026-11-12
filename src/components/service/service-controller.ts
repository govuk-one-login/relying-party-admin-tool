import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";
import { ClientEnvironment } from "../../models/client-environment.js";
import { getServiceByServiceId } from "../../datastores/services-data-store.js";
import { getAllClientsByServiceId } from "../../datastores/services-data-store.js";
import { Result } from "../../models/result.js";

export const serviceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    const serviceId = req.params.serviceId as string;
    const userId = "userId";
    const hasIntegrationWriterPermissions: boolean =
      await permissionsService.checkUserHasWriterPermissions(
        userId,
        serviceId,
        ClientEnvironment.INTEGRATION
      );
    const hasManagerPermissions =
      await permissionsService.checkUserHasManagerPermissions(
        userId,
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
        href: req.path + "/team-members",
      },
    ];

    const serviceResult = await Result.tryAsync(() =>
      getServiceByServiceId(serviceId)
    );

    if (!serviceResult.success) {
      req.log.error(serviceResult.error.message);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }

    const allClientsResult = await Result.tryAsync(() =>
      getAllClientsByServiceId(serviceId)
    );

    if (!allClientsResult.success) {
      req.log.error(allClientsResult.error.message);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }

    const productionClient = allClientsResult.value.filter(
      (client) => client.env === "production"
    )[0];
    const integrationClients = allClientsResult.value.filter(
      (client) => client.env === "integration"
    );

    return res.render("service/index.njk", {
      serviceId,
      hasIntegrationWriterPermissions,
      ...(hasManagerPermissions && { sideNavItems }),
      service: serviceResult.value,
      productionClient,
      ...(integrationClients.length > 0 && { integrationClients }),
    });
  };
};
