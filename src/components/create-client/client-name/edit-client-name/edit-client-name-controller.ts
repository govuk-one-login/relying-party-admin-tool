import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { permissionsService } from "../../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../../models/client-environment.js";

export const createClientEditClientNameGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/client-name/edit-client-name/index.njk", {
        serviceName: "Service Name",
        serviceId,
        clientName: req.session.newClientConfig?.name ?? "",
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientEditClientNamePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      name: req.body.name,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
