import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { saveSessionAndRedirect } from "../../utils/save-session-and-redirect.js";

export const callbackController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.query.error) {
    //TODO: Handle errors
    res.json({
      error: req.query.error,
      error_description: req.query.error_description,
    });
    return;
  }
  //TODO: Future ticket to do the callback stuff
  req.session.isAuthenticated = true;
  req.session.userId = "userId";

  return saveSessionAndRedirect(req, res, PATH_NAMES.SERVICES);
};
