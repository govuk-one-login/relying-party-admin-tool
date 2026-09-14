import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../../app.constants.js";
import { ExpressRouteFunc } from "../../../../types.js";
import { createClientRedirectUrlsPost } from "../shared.js";

export const createClientEditRedirectUrlsGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = req.params.serviceId as string;
    const redirectUrls = req.session?.newClientConfig?.redirectUrls || [];
    res.render("create-client/redirect-urls/edit-redirect-urls/index.njk", {
      serviceName: "Service Name",
      serviceId,
      redirectUrls,
    });
  };
};

export const createClientEditRedirectUrlsPost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    return createClientRedirectUrlsPost(
      req,
      res,
      PATH_NAMES.CREATE_CLIENT_SUMMARY,
      "create-client/redirect-urls/edit-redirect-urls/index.njk"
    );
  };
};
