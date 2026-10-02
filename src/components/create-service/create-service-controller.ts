import type { Request, Response } from "express";
import crypto from "crypto";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { getTestServiceId } from "../../config.js";
import { createNewServiceWithManagerUserPermissions } from "../../datastores/user-permissions-services-data-store.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId =
      getTestServiceId() ?? crypto.randomBytes(20).toString("base64url");
    const userId = "userId";
    const serviceName = req.body.name;

    try {
      await createNewServiceWithManagerUserPermissions(
        {
          serviceId,
          name: serviceName,
        },
        userId
      );

      req.log.info(
        { serviceId },
        `Successfully created service: ${serviceId} and manager user permissions`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error creating service and manager user permissions";
      req.log.error(errorMessage);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }

    return res.redirect(
      populateUrlRoute(PATH_NAMES.SERVICE, { [":serviceId"]: serviceId })
    );
  };
};
