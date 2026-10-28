import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { ExpressRouteFunc } from "../../../types.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";

export const editRedirectUrlsGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const redirectUrls =
      req.session.changedClientConfig?.redirectUrls ??
      req.session.currentClientConfig?.redirectUrls;
    res.render("clients/edit-redirect-urls/index.njk", {
      redirectUrls,
    });
  };
};

export const editRedirectUrlsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
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
      return res.render("clients/edit-redirect-urls/index.njk", {
        redirectUrls,
      });
    }

    if (action && action.startsWith("delete-")) {
      const indexToDelete = parseInt(action.split("-")[1], 10);
      redirectUrls.splice(indexToDelete, 1);
      return res.render("clients/edit-redirect-urls/index.njk", {
        redirectUrls,
      });
    }

    if (action === "continue") {
      req.session.newClientConfig = {
        ...req.session.newClientConfig,
        redirectUrls,
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
