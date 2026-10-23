import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../app.constants.js";

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
      `Failed CSRF validation, rendering to 403 page.  Original error: ${error.message}`
    );
    res.status(HTTP_STATUS_CODES.FORBIDDEN);
    res.render("common/errors/403.njk");
  } else {
    void next(error);
  }
};
