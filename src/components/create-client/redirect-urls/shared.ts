import type { Request, Response } from "express";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import { saveSessionAndRedirect } from "../../../utils/save-session-and-redirect.js";

export const createClientRedirectUrlsPost = async (
  req: Request,
  res: Response,
  redirectPath: string,
  templatePath: string
): Promise<void> => {
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
    return res.render(templatePath, {
      serviceName: "Service Name",
      serviceId: req.params.serviceId as string,
      redirectUrls,
    });
  }

  if (action && action.startsWith("delete-")) {
    const indexToDelete = parseInt(action.split("-")[1], 10);
    redirectUrls.splice(indexToDelete, 1);
    return res.render(templatePath, {
      serviceName: "Service Name",
      serviceId: req.params.serviceId as string,
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
      populateUrlRoute(redirectPath, {
        [":serviceId"]: req.params.serviceId as string,
      })
    );
  }
};
