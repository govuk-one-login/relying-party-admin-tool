import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../models/client-environment.js";

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

export const createClientSummaryPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    const userId = "userId";
    const clientId = "clientId";
    if (
      await permissionsService.checkUserHasWriterPermissions(
        userId,
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      // TODO: write to service/client database and send to client registry api
      req.log.info(
        {
          serviceId,
          clientId,
        },
        `Creating new client: ${clientId}`
      );
      req.session.newClientConfig = {};
      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUCCESS, {
          [":serviceId"]: req.params.serviceId as string,
        })
      );
    } else {
      req.log.warn(
        {
          serviceId,
        },
        "User does not have permissions to create an integration client"
      );
      return res.redirect(PATH_NAMES["403_ERROR"]);
    }
  };
};
