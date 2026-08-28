import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { permissionsService } from "../../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../../models/client-environment.js";

export const createClientEditClientAuthenticationGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render(
        "create-client/client-authentication-method/edit-client-authentication-method/index.njk",
        {
          serviceName: "Service Name",
          serviceId: req.params.serviceId as string,
          clientAuthenticationMethod:
            req.session.newClientConfig?.clientAuthenticationMethod,
          jwksUrl: req.session.newClientConfig?.jwksURL,
          publicKey: req.session.newClientConfig?.publicKey,
          clientSecret: req.session.newClientConfig?.clientSecret,
        }
      );
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientEditClientAuthenticationPost =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      if (req.body["client-authentication-method"] === "JWKS") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "JWKS",
          jwksURL: req.body["jwks-endpoint"],
          publicKey: undefined,
          clientSecret: undefined,
        };
      } else if (req.body["client-authentication-method"] === "STATIC") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "STATIC",
          publicKey: req.body["public-key"],
          jwksURL: undefined,
          clientSecret: undefined,
        };
      } else if (req.body["client-authentication-method"] === "CLIENT_SECRET") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientSecret: req.body["client-secret"],
          publicKey: undefined,
          jwksURL: undefined,
        };
      }

      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUMMARY, [
          req.params.serviceId as string,
        ])
      );
    };
  };
