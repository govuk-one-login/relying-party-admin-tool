import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";

export const createClientEditLandingPageUrlGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render(
      "create-client/landing-page-url/edit-landing-page-url/index.njk",
      {
        landingPageUrl: req.session.newClientConfig?.landingPageUrl ?? "",
      }
    );
  };
};

export const createClientEditLandingPageUrlPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      landingPageUrl: req.body["landing-page-url"],
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
