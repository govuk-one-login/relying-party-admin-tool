import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientSelectClientAuthenticationGet =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      if (
        await permissionsService.checkUserHasWriterPermissions(
          "user",
          "service",
          ClientEnvironment.INTEGRATION
        )
      ) {
        res.render("create-client/select-client-authentication/index.njk", {
          serviceName: "Service Name",
          serviceId: req.params.serviceId as string,
        });
      } else {
        return res.redirect(PATH_NAMES.ROOT);
      }
    };
  };

export const createClientSelectClientAuthenticationPost =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      if (req.body["client-authentication-method"] === "JWKS") {
        req.session.newClientData = {
          ...req.session.newClientData,
          clientAuthenticationMethod: "JWKS",
          jwksURL: req.body["jwks-endpoint"],
          clientTokenAuthenticationMethod: "private_key_jwt",
        };
      } else if (req.body["client-authentication-method"] === "STATIC") {
        req.session.newClientData = {
          ...req.session.newClientData,
          clientAuthenticationMethod: "STATIC",
          publicKey: req.body["public-key"],
          clientTokenAuthenticationMethod: "private_key_jwt",
        };
      } else if (req.body["client-authentication-method"] === "CLIENT_SECRET") {
        req.session.newClientData = {
          ...req.session.newClientData,
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "client_secret_post",
          clientSecret: req.body["client-secret"],
        };
      }

      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS, [
          req.params.serviceId as string,
        ])
      );
    };
  };
