import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";

export const createClientEditIsIdentityVerificationSupportedGet =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      res.render(
        "create-client/support-identity-verification/edit-support-identity-verification/index.njk",
        {
          supportIdentityVerification:
            req.session.newClientConfig?.isIdentityVerificationSupported?.toString(),
        }
      );
    };
  };

export const createClientEditIsIdentityVerificationSupportedPost =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      if (
        req.body["support-identity-verification"] ===
        req.session.newClientConfig?.isIdentityVerificationSupported?.toString()
      ) {
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, {
            [":serviceId"]: req.params.serviceId as string,
          })
        );
      }
      if (req.body["support-identity-verification"] === "true") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          isIdentityVerificationSupported: true,
          loc: undefined,
        };
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, {
            [":serviceId"]: req.params.serviceId as string,
          })
        );
      } else {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          isIdentityVerificationSupported: false,
          loc: ["P0"],
          landingPageUrl: undefined,
          claims: undefined,
        };
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
