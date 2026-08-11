import type { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";
import { getServicesUserCanView } from "../../services/service-permissions-service.js";

export const servicesGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    const services = await getServicesUserCanView("user");

    return res.render("service/index.njk", {
      services: services,
    });
  };
};
