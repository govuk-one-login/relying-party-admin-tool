import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../types.js";
import { permissionsService } from "../../services/permissions-service.js";

export const createClientStartGet = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/index.njk", {
        serviceName: "Service Name",
        serviceId: "serviceId",
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
