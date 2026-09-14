import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editIdTokenSigningAlgorithmGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-id-token-signing-algorithm/index.njk", {
      idTokenSigningAlgorithm:
        req.session.changedClientConfig?.idTokenSigningAlgorithm ??
        req.session.currentClientConfig?.idTokenSigningAlgorithm,
    });
  };
};

export const editIdTokenSigningAlgorithmPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      idTokenSigningAlgorithm: req.body["id-token-signing-algorithm"],
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
