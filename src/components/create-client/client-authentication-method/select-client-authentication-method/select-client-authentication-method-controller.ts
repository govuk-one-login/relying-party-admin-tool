import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { populateUrlRoute } from "../../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../../utils/save-session-and-redirect.js";

export const createClientSelectClientAuthenticationGet =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      const serviceId = req.params.serviceId as string;
      res.render(
        "create-client/client-authentication-method/select-client-authentication-method/index.njk",
        {
          serviceName: "Service Name",
          serviceId,
        }
      );
    };
  };

export const createClientSelectClientAuthenticationPost =
  (): ExpressRouteFunc => {
    return async (req: Request, res: Response) => {
      if (req.body["client-authentication-method"] === "JWKS") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "JWKS",
          jwksURL: req.body["jwks-endpoint"],
          clientTokenAuthenticationMethod: "private_key_jwt",
        };
      } else if (req.body["client-authentication-method"] === "STATIC") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "STATIC",
          publicKey: req.body["public-key"],
          clientTokenAuthenticationMethod: "private_key_jwt",
        };
      } else if (req.body["client-authentication-method"] === "CLIENT_SECRET") {
        req.session.newClientConfig = {
          ...req.session.newClientConfig,
          clientAuthenticationMethod: "CLIENT_SECRET",
          clientTokenAuthenticationMethod: "client_secret_post",
          clientSecret: req.body["client-secret"],
        };
      }

      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS, {
          [":serviceId"]: req.params.serviceId as string,
        })
      );
    };
  };
