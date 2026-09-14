import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientEnterLandingPageUrlGet = (): ExpressRouteFunc => {
  return async function (_req: Request, res: Response) {
    res.render("create-client/enter-landing-page-url/index.njk");
  };
};

export const createClientEnterLandingPageUrlPost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      landingPageUrl: req.body["landing-page-url"],
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
