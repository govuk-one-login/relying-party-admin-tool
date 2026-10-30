import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../utils/save-session-and-redirect.js";

export const createClientStartGet = (): ExpressRouteFunc => {
  return async (_req: Request, res: Response) => {
    res.render("create-client/index.njk");
  };
};

export const createClientStartPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.newClientConfig = {};
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_NEXT, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
