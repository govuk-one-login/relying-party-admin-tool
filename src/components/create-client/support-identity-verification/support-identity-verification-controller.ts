import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientIsIdentityVerificationSupportedGet =
  (): ExpressRouteFunc => {
    return async (_req: Request, res: Response) => {
      res.render("create-client/support-identity-verification/index.njk");
    };
  };

export const createClientIsIdentityVerificationSupportedPost =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      req.session.newClientConfig = {
        ...req.session.newClientConfig,
        isIdentityVerificationSupported:
          req.body["support-identity-verification"] === "true",
      };
      if (req.body["support-identity-verification"] === "true") {
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, {
            [":serviceId"]: req.params.serviceId as string,
          })
        );
      } else {
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, {
            [":serviceId"]: req.params.serviceId as string,
          })
        );
      }
    };
  };
