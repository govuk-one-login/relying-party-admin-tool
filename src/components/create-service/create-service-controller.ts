import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { ExpressRouteFunc } from "../../types.js";

export const createServicePost = (): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    return res.redirect(PATH_NAMES.ROOT);
  };
};
