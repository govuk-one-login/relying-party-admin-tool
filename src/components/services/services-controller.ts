import type { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";
import { getServicesUserCanView } from "../../services/service-permissions-service.js";
import { PATH_NAMES } from "../../app.constants.js";

export const servicesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    const userId = "userId";
    try {
      const services = await getServicesUserCanView(userId);
      return res.render("services/index.njk", {
        services: services,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching services";
      req.log.error(errorMessage);
      return res.redirect(PATH_NAMES["500_ERROR"]);
    }
  };
};
