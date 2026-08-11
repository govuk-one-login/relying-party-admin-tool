import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientEnterLandingPageUrlGet = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/enter-landing-page-url/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientEnterLandingPageUrlPost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    req.session.newClientData = {
      ...req.session.newClientData,
      landingPageUrl: req.body["landing-page-url"],
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE, [
        req.params.serviceId as string,
      ])
    );
  };
};
