import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientSelectClaimsGet = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      res.render("create-client/select-claims/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientSelectClaimsPost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const claims: string[] = [
      "https://vocab.account.gov.uk/v1/coreIdentityJWT",
    ];
    if (req.body["selected-claims"]) {
      if (Array.isArray(req.body["selected-claims"])) {
        claims.concat(req.body["selected-claims"]);
      } else {
        claims.push(req.body["selected-claims"]);
      }
    }
    req.session.newClientData = {
      ...req.session.newClientData,
      claims,
    };
    return saveSessionAndRedirect(
      req,
      res,
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL, [
        req.params.serviceId as string,
      ])
    );
  };
};
