import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { getListFromRequestBody } from "../../../helpers/request-helpers.js";

export const createClientSelectLevelsOfConfidenceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
      res.render("create-client/select-levels-of-confidence/index.njk");
  };
};

export const createClientSelectLevelsOfConfidencePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const loc = getListFromRequestBody(req, "selected-locs");
    req.session.newClientConfig = {
      ...req.session.newClientConfig,
      loc,
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
