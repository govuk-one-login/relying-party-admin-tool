import { Request, Response, NextFunction } from "express";
import { getOidcConfig } from "../oidc/oidc-client.js";
import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from "openid-client";
import { generateJarRequest } from "../oidc/generate-jar-auth-request.js";
import { saveSessionAndRedirect } from "../utils/save-session-and-redirect.js";
import { PATH_NAMES } from "../app.constants.js";

export const checkAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.session.isAuthenticated && req.session.userId) {
    // TODO: We will create another middleware to handle token refreshing which will be applied after this middleware
    next();
    return;
  }

  const oidcConfig = await getOidcConfig();

  if (!oidcConfig.success) {
    req.log.error(
      { err: oidcConfig.error, cause: oidcConfig.error.cause },
      "Failed to get OIDC config"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const state = randomState();
  const codeVerifier = randomPKCECodeVerifier();
  const nonce = randomNonce();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const requestObject = await generateJarRequest(
    oidcConfig.value,
    state,
    nonce,
    codeChallenge
  );

  if (!requestObject.success) {
    req.log.error(
      { err: requestObject.error, cause: requestObject.error.cause },
      "Failed to generate JAR for auth request"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const redirectUrl = buildAuthorizationUrl(oidcConfig.value, {
    request: requestObject.value,
  });
  req.session.state = state;
  req.session.nonce = nonce;
  req.session.codeVerifier = codeVerifier;

  return saveSessionAndRedirect(req, res, redirectUrl.href);
};
