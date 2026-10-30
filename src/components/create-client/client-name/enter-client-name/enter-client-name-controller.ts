import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";

export const createClientEnterClientNameGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("create-client/client-name/enter-client-name/index.njk", {
      clientName: req.session.newClientConfig?.name ?? "",
    });
  };
};

export const createClientEnterClientNamePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      clientName: req.body["client-name"],
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_NEXT, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
