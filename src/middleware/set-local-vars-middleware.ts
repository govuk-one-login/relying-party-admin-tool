import type { NextFunction, Request, Response } from "express";
import { generateNonce } from "../utils/strings.js";
import { PATH_NAMES } from "../app.constants.js";
export const setLocalVarsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.locals.scriptNonce = await generateNonce();
  res.locals.landingPageUrl = PATH_NAMES.ROOT;
  next();
};
