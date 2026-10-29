import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../models/client-environment.js";
import { ClientRegistryService } from "../../../api/client-registry-service.js";
import { addClientToService } from "../../../datastores/services-data-store.js";

export const createClientSummaryGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("create-client/summary/index.njk", {
      client: req.session.newClientConfig,
      baseUrl: populateUrlRoute(PATH_NAMES.CREATE_CLIENT, {
        [":serviceId"]: req.params.serviceId as string,
      }),
    });
  };
};

export const createClientSummaryPost = (
  clientRegistryService: ClientRegistryService
): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    const userId = "userId";
    const isPermitted = await permissionsService.checkUserHasWriterPermissions(
      userId,
      serviceId,
      ClientEnvironment.INTEGRATION
    );

    if (!isPermitted) {
      req.log.warn(
        {
          serviceId,
        },
        "User does not have permissions to create an integration client"
      );
      return res.redirect(PATH_NAMES["403_ERROR"]);
    }

    const clientResult = await clientRegistryService.addClientToClientRegistry(
      req.session.newClientConfig!,
      serviceId
    );

    if (!clientResult.success) {
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }
    const clientResponse = clientResult.value;
    await addClientToService({
      serviceId,
      clientId: clientResponse.clientId,
      env: ClientEnvironment.INTEGRATION,
      name: clientResponse.clientName,
    });

    req.log.info(
      {
        serviceId,
        clientId: clientResponse.clientId,
      },
      `Created new client`
    );

    req.session.newClientConfig = {};
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUCCESS, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
