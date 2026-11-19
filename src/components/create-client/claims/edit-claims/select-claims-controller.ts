import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";
import { getOptionalList } from "../../../../helpers/request-helpers.js";

export const createClientEditClaimsGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const claims = req.session?.newClientConfig?.claims || [];
    res.render("create-client/claims/edit-claims/index.njk", {
      claims,
    });
  };
};

export const createClientEditClaimsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const claims = getOptionalList(req.body["selected-claims"]);
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      claims,
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
