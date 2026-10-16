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
    res.status(HTTP_STATUS_CODES.NOT_FOUND);
    return res.render("common/errors/404.njk");
  }

  const service = await getServiceByServiceId(serviceId);

  if (!service) {
    res.status(HTTP_STATUS_CODES.NOT_FOUND);
    return res.render("common/errors/404.njk");
  }
  next();
  return;
};
