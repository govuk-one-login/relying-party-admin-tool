import type { Request, Response } from "express";
import crypto from "crypto";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { createService } from "../../datastores/services-data-store.js";
import { getTestServiceId } from "../../config.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId =
      getTestServiceId() ?? crypto.randomBytes(20).toString("base64url");
    const serviceName = req.body.name;

    try {
      await createService({
        serviceId,
        name: serviceName,
      });

      req.log.info({ serviceId }, `Successfully created service: ${serviceId}`);
      // TODO: add user to user permissions with manager role
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error creating service";
      req.log.error(errorMessage);
      res.redirect(PATH_NAMES["500_ERROR"]);
    }

    return res.redirect(
      populateUrlRoute(PATH_NAMES.SERVICE, { [":serviceId"]: serviceId })
    );
  };
};
