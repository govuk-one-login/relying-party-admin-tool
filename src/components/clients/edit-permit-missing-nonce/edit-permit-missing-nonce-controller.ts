import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editPermitMissingNonceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-permit-missing-nonce/index.njk", {
      permitMissingNonce:
        req.session.changedClientConfig?.permitMissingNonce ??
        req.session.currentClientConfig?.permitMissingNonce,
    });
  };
};

export const editPermitMissingNoncePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      permitMissingNonce: req.body["permit-missing-nonce"],
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
