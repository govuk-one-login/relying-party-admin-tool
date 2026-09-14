import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editIsActiveGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-is-active/index.njk", {
      isActive:
        req.session.changedClientConfig?.isActive ??
        req.session.currentClientConfig?.isActive,
    });
  };
};

export const editIsActivePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      isActive: req.body["is-active"],
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
