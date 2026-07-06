import { NextFunction, Request, Response } from "express";
import { ValidationChain } from "express-validator";

export enum ClientEnvironment {
  INTEGRATION = "integration",
  PRODUCTION = "production",
}

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export type ValidationChainFunc = (
  | ValidationChain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((req: Request, res: Response, next: NextFunction) => any)
)[];
