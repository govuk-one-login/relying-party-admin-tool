import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";
import { getListFromRequestBody } from "../../../../helpers/request-helpers.js";

export const createClientEditScopesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const scopes = req.session?.newClientConfig?.scopes || [];
    res.render("create-client/scopes/edit-scopes/index.njk", { scopes });
  };
};

export const createClientEditScopesPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    let scopes = ["openid"];
    scopes = scopes.concat(getListFromRequestBody(req, "selected-scopes"));
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      scopes,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
