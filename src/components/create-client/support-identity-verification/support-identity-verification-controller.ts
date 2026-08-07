import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientIsIdentityVerificationSupportedGet =
  (): ExpressRouteFunc => {
    return async function (req: Request, res: Response) {
      if (
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          "service",
          ClientEnvironment.INTEGRATION
        )
      ) {
        res.render("create-client/support-identity-verification/index.njk", {
          serviceName: "Service Name",
          serviceId: req.params.serviceId as string,
        });
      } else {
        return res.redirect(PATH_NAMES.ROOT);
      }
    };
  };

export const createClientIsIdentityVerificationSupportedPost =
  (): ExpressRouteFunc => {
    return async function (req: Request, res: Response) {
      req.session.newClientData = {
        ...req.session.newClientData,
        isIdentityVerificationSupported:
          req.body["support-identity-verification"] === "true",
      };
      if (req.body["support-identity-verification"] === "true") {
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS, [
            req.params.serviceId as string,
          ])
        );
      } else {
        return saveSessionAndRedirect(
          req,
          res,
          populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, [
            req.params.serviceId as string,
          ])
        );
      }
    };
  };
