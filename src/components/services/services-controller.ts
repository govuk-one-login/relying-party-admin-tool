import type { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";
import { getServicesUserCanView } from "../../services/service-permissions-service.js";
import { PATH_NAMES } from "../../app.constants.js";
import { Result } from "../../models/result.js";

export const servicesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    const userId = "userId";

    const servicesResult = await Result.tryAsync(() =>
      getServicesUserCanView(userId)
    );

    if (!servicesResult.success) {
      req.log.error(servicesResult.error.message);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }

    return res.render("services/index.njk", {
      services: servicesResult.value,
    });
  };
};
