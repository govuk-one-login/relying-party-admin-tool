import type { NextFunction, Request, Response } from "express";
import { generateNonce } from "../utils/strings.js";
export async function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.scriptNonce = await generateNonce();
  next();
}
