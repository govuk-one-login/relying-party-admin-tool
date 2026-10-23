import { NextFunction, Request, Response } from "express";
import { getServiceByServiceId } from "../datastores/services-data-store.js";
import { HTTP_STATUS_CODES } from "../app.constants.js";

export const serviceExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const serviceId = req.params.serviceId;

  if (typeof serviceId !== "string") {
    req.log.warn("Invalid service ID in path params");
    res.status(HTTP_STATUS_CODES.FORBIDDEN);
    return res.render("common/errors/403.njk");
  }

  const service = await getServiceByServiceId(serviceId);

  if (!service) {
    req.log.warn("Unknown service ID in path params");
    res.status(HTTP_STATUS_CODES.FORBIDDEN);
    return res.render("common/errors/403.njk");
  }
  next();
  return;
};
