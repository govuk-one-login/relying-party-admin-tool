import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { getListFromRequestBody } from "../../../helpers/request-helpers.js";

export const createClientSelectClaimsGet = (): ExpressRouteFunc => {
  return async (_req: Request, res: Response) => {
    res.render("create-client/select-claims/index.njk");
  };
};

export const createClientSelectClaimsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const claims = getListFromRequestBody(req, "selected-claims");
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      claims,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  };
};
