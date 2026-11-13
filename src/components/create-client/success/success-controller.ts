import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";

export const createClientSuccessGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const clientId = req.session.newClientConfig?.clientId;
    req.session.newClientConfig = {};

    if (!clientId) {
      return res.redirect(
        populateUrlRoute(PATH_NAMES.SERVICE, {
          [":serviceId"]: req.params.serviceId as string,
        })
      );
    }

    res.render("create-client/success/index.njk", {
      clientId,
      serviceUrl: populateUrlRoute(PATH_NAMES.SERVICE, {
        [":serviceId"]: req.params.serviceId as string,
      }),
    });
  };
};
