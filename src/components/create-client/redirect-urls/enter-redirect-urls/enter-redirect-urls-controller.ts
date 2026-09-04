import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { permissionsService } from "../../../../services/permissions-service.js";
import { ClientEnvironment } from "../../../../models/client-environment.js";
import { createClientRedirectUrlsPost } from "../shared.js";

export const createClientEnterRedirectUrlsGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      const redirectUrls = req.session?.newClientConfig?.redirectUrls || [];
      res.render("create-client/redirect-urls/enter-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId,
        redirectUrls,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientEnterRedirectUrlsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    return createClientRedirectUrlsPost(
      req,
      res,
      PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
      "create-client/redirect-urls/enter-redirect-urls/index.njk"
    );
  };
};
