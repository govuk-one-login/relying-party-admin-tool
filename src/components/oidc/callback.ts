import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { saveSessionAndRedirect } from "../../utils/save-session-and-redirect.js";
import { getOidcConfig } from "../../oidc/oidc-client.js";

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

  if (!isValidCallbackQueryParams(req)) {
    req.log.warn("No state or auth code returned from OIDC provider");
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  if (!isSessionValid(req.session)) {
    req.log.warn("No valid OIDC authorisation session data found");
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const oidcConfig = await getOidcConfig();

  if (!oidcConfig.success) {
    req.log.error({ error: oidcConfig.error }, "Failed to get OIDC config");
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  req.session.isAuthenticated = true;
  req.session.userId = "userId";

  return saveSessionAndRedirect(req, res, PATH_NAMES.SERVICES);
};

const isValidCallbackQueryParams = (req: Request): boolean => {
  return (
    !!req.query.state &&
    typeof req.query.state === "string" &&
    !!req.query.code &&
    typeof req.query.code === "string"
  );
};

const isSessionValid = (session: Request["session"]): boolean => {
  return (
    typeof session.state === "string" &&
    typeof session.nonce === "string" &&
    typeof session.codeVerifier === "string"
  );
};
