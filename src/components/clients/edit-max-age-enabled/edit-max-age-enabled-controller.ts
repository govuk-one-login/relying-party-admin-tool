import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editMaxAgeEnabledGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-max-age-enabled/index.njk", {
      maxAgeEnabled:
        req.session.changedClientConfig?.maxAgeEnabled ??
        req.session.currentClientConfig?.maxAgeEnabled,
    });
  };
};

export const editMaxAgeEnabledPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      maxAgeEnabled: req.body["max-age-enabled"],
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
