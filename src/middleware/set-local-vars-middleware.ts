import type { NextFunction, Request, Response } from "express";
import { generateNonce } from "../utils/strings.js";
import { PATH_NAMES } from "../app.constants.js";
export async function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.scriptNonce = await generateNonce();
  res.locals.landingPageUrl = PATH_NAMES.ROOT;
  next();
}
