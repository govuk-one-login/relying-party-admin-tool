import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { saveSessionAndRedirect } from "../../utils/save-session-and-redirect.js";
import { getOidcConfig } from "../../oidc/oidc-client.js";
import { Result } from "../../models/result.js";
import { getOidcCallbackUrl } from "../../config.js";
import {
  authorizationCodeGrant,
  ClientError,
  fetchUserInfo,
  UserInfoResponse,
} from "openid-client";
import { addUser } from "../../datastores/user-permissions-data-store.js";

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

  const currentUrl = new URL(getOidcCallbackUrl());
  currentUrl.search = new URLSearchParams({
    code: req.query.code as string,
    state: req.query.state as string,
    ...(req.query.iss && {
      // auth response iss claim is optional but the stub requires it
      iss: req.query.iss as string,
    }),
  }).toString();

  const tokenRespose = await Result.tryAsync(() =>
    authorizationCodeGrant(oidcConfig.value, currentUrl, {
      expectedNonce: req.session.nonce,
      expectedState: req.session.state,
      pkceCodeVerifier: req.session.codeVerifier,
    })
  );

  if (!tokenRespose.success) {
    const error = tokenRespose.error as ClientError;
    req.log.warn(
      {
        error: error.message,
        code: error.code ?? "No error Code",
        cause: error.cause,
      },
      "Failed to get tokens from OIDC token endpoint"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const { access_token, id_token, claims } = tokenRespose.value;
  const idTokenClaims = claims();

  if (!access_token || !id_token || typeof idTokenClaims === "undefined") {
    //TODO: Add refresh token checking
    req.log.error("No access or id_token returned from OIDC provider");
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const userId = idTokenClaims.sub;

  const userInfoResponse = await Result.tryAsync(() =>
    fetchUserInfo(oidcConfig.value, access_token, userId)
  );

  if (!userInfoResponse.success) {
    const error = userInfoResponse.error as ClientError;
    req.log.error(
      {
        error: error.message,
        code: error.code ?? "No error Code",
        cause: error.cause,
      },
      "Failed to get userinfo from OIDC provider"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  const userInfo = userInfoResponse.value;

  if (!isValidUserInfo(userInfo)) {
    req.log.error("Userinfo missing required information");
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }

  // Do we need a name attribute? If so how should we derive it and is it mandatory?
  const putUserResult = await Result.tryAsync(() =>
    addUser(userId, userInfo.email, userInfo.given_name ?? "User")
  );

  if (!putUserResult.success) {
    req.log.error(
      { error: putUserResult.error },
      "Failed to put user in dynamo"
    );
    res.redirect(PATH_NAMES["500_ERROR"]);
    return;
  }
  // regenerate session to prevent session fixation
  await regenerateSession(req.session);

  req.session.isAuthenticated = true;
  req.session.userId = userId;
  req.session.idToken = id_token;

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

const regenerateSession = (session: Request["session"]): Promise<void> => {
  return new Promise((res, rej) => {
    session.regenerate((err) => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
};

const isValidUserInfo = (
  userinfo: UserInfoResponse
): userinfo is {
  email: string;
  email_verified: true;
  sub: string;
} & UserInfoResponse => {
  return (
    typeof userinfo.email === "string" &&
    typeof userinfo.sub === "string" &&
    typeof userinfo.email_verified === "boolean" &&
    userinfo.email_verified === true
  );
};
