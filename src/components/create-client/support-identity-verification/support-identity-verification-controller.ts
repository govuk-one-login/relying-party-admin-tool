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
      const isIdentityVerificationSupported =
        req.body["support-identity-verification"] === "true";
      req.session.newClientConfig = {
        ...req.session.newClientConfig,
        isIdentityVerificationSupported,
        ...(!isIdentityVerificationSupported && {
          claims: [],
          loc: ["PO"],
          landingPageUrl: undefined,
        }),
      };
      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_NEXT, {
          [":serviceId"]: req.params.serviceId as string,
        })
      );
    };
  };
