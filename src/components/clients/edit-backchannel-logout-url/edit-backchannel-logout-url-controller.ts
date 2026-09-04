import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../models/client-environment.js";

export const editBackchannelLogoutUrlGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("clients/edit-backchannel-logout-url/index.njk", {
        serviceName: "Service Name",
        serviceId,
        backchannelLogoutUrl:
          req.session.changedClientConfig?.backchannelLogoutUrl ??
          req.session.currentClientConfig?.backchannelLogoutUrl,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const editBackchannelLogoutUrlPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      backchannelLogoutUrl: req.body["backchannel-logout-url"],
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CLIENT, {
        [":serviceId"]: req.params.serviceId as string,
        [":clientId"]: req.params.clientId as string,
      })
    );
  };
};
