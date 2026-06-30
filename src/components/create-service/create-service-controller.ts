import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const serviceId = "serviceId";
    return res.redirect(populateUrlRoute(PATH_NAMES.SERVICE, [serviceId]));
  };
};
