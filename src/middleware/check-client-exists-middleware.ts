import { NextFunction, Request, Response } from "express";
import { ClientEnvironment } from "../models/client-environment.js";
import { HTTP_STATUS_CODES } from "../app.constants.js";
import { getClientForService } from "../datastores/services-data-store.js";

export const checkClientExistsForEnvMiddleware =
  (env: ClientEnvironment) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const serviceId = req.params.serviceId;
    const clientId = req.params.clientId;

    if (typeof serviceId !== "string" || typeof clientId !== "string") {
      req.log.warn("Invalid service or client ID in path params");
      res.status(HTTP_STATUS_CODES.FORBIDDEN);
      return res.render("common/errors/403.njk");
    }

    const clientFromService = await getClientForService(
      serviceId,
      clientId,
      env
    );

    if (!clientFromService) {
      req.log.warn("Service Client summary not found");
      res.status(HTTP_STATUS_CODES.FORBIDDEN);
      return res.render("common/errors/403.njk");
    }
    next();
    return;
  };
