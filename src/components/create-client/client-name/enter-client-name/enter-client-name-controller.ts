import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";

export const createClientEnterClientNameGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    res.render("create-client/client-name/enter-client-name/index.njk", {
      serviceName: "Service Name",
      serviceId,
    });
  };
};

export const createClientEnterClientNamePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      name: req.body.name,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
