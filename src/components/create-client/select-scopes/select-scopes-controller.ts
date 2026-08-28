import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { getListFromRequestBody } from "../../../helpers/request-helpers.js";
import { ClientEnvironment } from "../../../models/client-environment.js";

export const createClientSelectScopesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/select-scopes/index.njk", {
        serviceName: "Service Name",
        serviceId,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientSelectScopesPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    let scopes = getListFromRequestBody(req, "selected-scopes");
    scopes = scopes.concat("openid");
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      scopes,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
