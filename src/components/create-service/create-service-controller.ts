import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { getTestServiceId } from "../../config.js";
import { createNewServiceWithManagerUserPermissions } from "../../datastores/user-permissions-services-data-store.js";
import { randomBytes } from "crypto";
import { Result } from "../../models/result.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async (req: Request, res: Response) => {
    const serviceId =
      getTestServiceId() ?? randomBytes(20).toString("base64url");
    const userId = "userId";
    const serviceName = req.body.name;

    const createServiceResult = await Result.tryAsync(() =>
      createNewServiceWithManagerUserPermissions(
        {
          serviceId,
          name: serviceName,
        },
        userId
      )
    );

    if (!createServiceResult.success) {
      req.log.error(createServiceResult.error.message);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }
    req.log.info(
      { serviceId },
      `Successfully created service: ${serviceId} and manager user permissions`
    );

    return res.redirect(
      populateUrlRoute(PATH_NAMES.SERVICE, { [":serviceId"]: serviceId })
    );
  };
};
