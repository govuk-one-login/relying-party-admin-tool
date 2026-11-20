import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const editIsIdentityVerificationSupportedGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    res.render("clients/edit-support-identity-verification/index.njk", {
      isActive:
        req.session.changedClientConfig?.isIdentityVerificationSupported ??
        req.session.currentClientConfig?.isIdentityVerificationSupported,
    });
  };
};

export const editIsIdentityVerificationSupportedPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const currentIsIdentityVerficationSupportedValue =
      req.session.changedClientConfig?.isIdentityVerificationSupported ??
      req.session.currentClientConfig?.isIdentityVerificationSupported;
    const isFieldUpdated =
      req.body["support-identity-verification"] !==
      currentIsIdentityVerficationSupportedValue?.toString();
    if (isFieldUpdated) {
      if (req.body["support-identity-verification"] === "true") {
        req.session.changedClientConfig = {
          ...req.session.changedClientConfig,
          isIdentityVerificationSupported: true,
          loc: [],
        };
      } else {
        req.session.changedClientConfig = {
          ...req.session.changedClientConfig,
          isIdentityVerificationSupported: false,
          loc: ["P0"],
          landingPageUrl: undefined,
          claims: [],
        };
      }
    }
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
