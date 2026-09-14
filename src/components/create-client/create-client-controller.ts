import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";

export const createClientStartGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    res.render("create-client/index.njk", {
      serviceName: "Service Name",
      serviceId,
    });
  };
};

export const createClientStartPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    return res.redirect(
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
