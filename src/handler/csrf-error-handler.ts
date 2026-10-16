import { NextFunction, Request, Response } from "express";
import { PATH_NAMES } from "../app.constants.js";

export const csrfErrorHandler = (
  error: { code: string; message?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    void next();
    return;
  }

  if (error.code === "EBADCSRFTOKEN") {
    req.log.info(
      `Failed CSRF validation, redirecting to 403 page.  Original error: ${error.message}`
    );
    res.redirect(PATH_NAMES["403_ERROR"]);
  } else {
    void next(error);
  }
};
