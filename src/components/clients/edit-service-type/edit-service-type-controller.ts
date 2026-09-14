import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editServiceTypeGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    res.render("clients/edit-service-type/index.njk", {
      serviceName: "Service Name",
      serviceId,
      serviceType:
        req.session.changedClientConfig?.serviceType ??
        req.session.currentClientConfig?.serviceType,
    });
  };
};

export const editServiceTypePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      serviceType: req.body["service-type"],
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
