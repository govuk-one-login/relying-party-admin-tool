import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ClientEnvironment, ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";

export const createClientEnterRedirectUrlsGet = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        "service",
        ClientEnvironment.INTEGRATION
      )
    ) {
      const redirectUrls = req.session?.newClientData?.redirectUrls || [];
      res.render("create-client/enter-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
        redirectUrls,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const createClientEnterRedirectUrlsPost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { action } = req.body;
    const redirectUrlInput = req.body["redirect-url-input"];
    let redirectUrls: string[] = [];
    if (req.body["redirect-urls"]) {
      redirectUrls = Array.isArray(req.body["redirect-urls"])
        ? req.body["redirect-urls"]
        : [req.body["redirect-urls"]];
    }

    if (action === "add") {
      redirectUrls.push(redirectUrlInput.trim());
      return res.render("create-client/enter-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
        redirectUrls,
      });
    }

    if (action && action.startsWith("delete-")) {
      const indexToDelete = parseInt(action.split("-")[1], 10);
      redirectUrls.splice(indexToDelete, 1);
      return res.render("create-client/enter-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
        redirectUrls,
      });
    }

    if (action === "continue") {
      req.session.newClientData = {
        ...req.session.newClientData,
        redirectUrls,
      };
      return res.redirect(
        populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES, [
          req.params.serviceId as string,
        ])
      );
    }
  };
};
