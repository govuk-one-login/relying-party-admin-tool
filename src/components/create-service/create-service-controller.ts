import type { Request, Response } from "express";
import crypto from "crypto";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { createService } from "../../datastores/services-data-store.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId = crypto.randomBytes(20).toString("base64url");
    const serviceName = req.body.name;
    if (!serviceName) {
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }
    try {
      await createService({
        serviceId,
        name: serviceName,
      });
      // TODO: add user to user permissions with manager role
    } catch {
      res.redirect(PATH_NAMES["500_ERROR"]);
    }
    return res.redirect(populateUrlRoute(PATH_NAMES.SERVICE, [serviceId]));
  };
};
