import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { getListFromRequestBody } from "../../../helpers/request-helpers.js";

export const editScopesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const scopes =
      req.session?.changedClientConfig?.scopes ??
      req.session?.currentClientConfig?.scopes;
    res.render("clients/edit-scopes/index.njk", { scopes });
  };
};

export const editScopesPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    let scopes = ["openid"];
    scopes = scopes.concat(getListFromRequestBody(req, "selected-scopes"));
    req.session.changedClientConfig = {
      ...req.session.changedClientConfig,
      scopes,
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
