import { Request, Response } from "express";

export const saveSessionAndRedirect = (
  req: Request,
  res: Response,
  redirectUrl: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.save((error: Error) => {
      if (error) {
        req.log.error(error.message);
        reject(error);
      } else {
        resolve(res.redirect(redirectUrl));
      }
    });
  });
};
