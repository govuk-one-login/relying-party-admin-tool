import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientSelectScopesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/select-scopes/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientSelectScopesPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const scopes: string[] = ["openid"];
    if (req.body["selected-scopes"]) {
      if (Array.isArray(req.body["selected-scopes"])) {
        scopes.concat(req.body["selected-scopes"]);
      } else {
        scopes.push(req.body["selected-scopes"]);
      }
    }
    req.session.newClientData = {
      ...req.session.newClientData,
      scopes,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT, [
        req.params.serviceId as string,
      ])
    );
  };
};
