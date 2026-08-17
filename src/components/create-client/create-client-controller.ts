import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../types.js";
import { permissionsService } from "../../services/permissions-service.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";

export const createClientStartGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientStartPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    return res.redirect(
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, [
        req.params.serviceId as string,
      ])
    );
  };
};
