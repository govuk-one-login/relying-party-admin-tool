import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { saveSessionAndRedirect } from "../../utils/save-session-and-redirect.js";

export const callbackController = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.query.error) {
    req.log.warn(
      {
        error: req.query.error,
        error_description: req.query.error_description,
      },
      "Error returned from OIDC provider"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }
  //TODO: Future ticket to do the callback stuff
  req.session.isAuthenticated = true;
  req.session.userId = "userId";

  return saveSessionAndRedirect(req, res, PATH_NAMES.SERVICES);
};
