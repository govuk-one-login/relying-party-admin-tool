import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { ClientEnvironment } from "../../../models/client-environment.js";

export const editPostLogoutRedirectUrlsGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    if (
      await permissionsService.checkUserHasWriterPermissions(
        "user",
        serviceId,
        ClientEnvironment.INTEGRATION
      )
    ) {
      const redirectUrls =
        req.session?.changedClientConfig?.postLogoutRedirectUrls ??
        req.session?.currentClientConfig?.postLogoutRedirectUrls;
      res.render("clients/edit-post-logout-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId,
        redirectUrls,
      });
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};

export const editPostLogoutRedirectUrlsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const { action } = req.body;
    const postLogoutRedirectUrlInput =
      req.body["post-logout-redirect-url-input"];
    let postLogoutRedirectUrls: string[] = [];
    if (req.body["post-logout-redirect-urls"]) {
      postLogoutRedirectUrls = Array.isArray(
        req.body["post-logout-redirect-urls"]
      )
        ? req.body["post-logout-redirect-urls"]
        : [req.body["post-logout-redirect-urls"]];
    }

    if (action === "add") {
      postLogoutRedirectUrls.push(postLogoutRedirectUrlInput.trim());
      return res.render("clients/edit-post-logout-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
        postLogoutRedirectUrls,
      });
    }

    if (action && action.startsWith("delete-")) {
      const indexToDelete = parseInt(action.split("-")[1], 10);
      postLogoutRedirectUrls.splice(indexToDelete, 1);
      return res.render("clients/edit-post-logout-redirect-urls/index.njk", {
        serviceName: "Service Name",
        serviceId: req.params.serviceId as string,
        postLogoutRedirectUrls,
      });
    }

    if (action === "continue") {
      req.session.changedClientConfig = {
        ...req.session.changedClientConfig,
        postLogoutRedirectUrls,
      };
      return saveSessionAndRedirect(
        req,
        res,
        populateUrlRoute(PATH_NAMES.CLIENT, {
          [":serviceId"]: req.params.serviceId as string,
          [":clientId"]: req.params.clientId as string,
        })
      );
    }
  };
};
