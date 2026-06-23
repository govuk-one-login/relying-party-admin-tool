import type { Request, Response } from "express";
import { permissionsService } from "../../services/permissions-service.js";
import { ExpressRouteFunc } from "../../types.js";
import { PATH_NAMES } from "../../app.constants.js";

export const serviceGet = (): ExpressRouteFunc => {
  return async (req: Request, res: Response): Promise<void> => {
    if (
      await permissionsService.checkUserHasReaderPermissions("user", "service")
    ) {
      res.render("service/index.njk");
    } else {
      return res.redirect(PATH_NAMES.ROOT);
    }
  };
};
