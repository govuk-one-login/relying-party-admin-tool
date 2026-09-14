import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editPKCEEnforcedGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-pkce-enforced/index.njk", {
      pkceEnforced:
        req.session.changedClientConfig?.pkceEnforced ??
        req.session.currentClientConfig?.pkceEnforced,
    });
  };
};

export const editPKCEEnforcedPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      pkceEnforced: req.body["pkce-enforced"],
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
