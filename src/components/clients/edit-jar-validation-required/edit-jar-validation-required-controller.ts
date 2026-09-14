import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editJarValidationRequiredGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    res.render("clients/edit-jar-validation-required/index.njk", {
      serviceName: "Service Name",
      serviceId,
      jarValidationRequired:
        req.session.changedClientConfig?.jarValidationRequired ??
        req.session.currentClientConfig?.jarValidationRequired,
    });
  };
};

export const editJarValidationRequiredPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      jarValidationRequired: req.body["jar-validation-required"],
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
