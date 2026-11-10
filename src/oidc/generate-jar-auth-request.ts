import { Configuration } from "openid-client";
import {
  getOidcCallbackUrl,
  getOidcScopes,
  getOidcSigningKeyAlias,
} from "../config.js";
import { signRequestWithKms } from "./oidc-kms-service.js";
import { Result } from "../models/result.js";

export const generateJarRequest = async (
  config: Configuration,
  state: string,
  nonce: string,
  codeChallenge: string,
  redirect_uri = getOidcCallbackUrl(),
  scope = getOidcScopes(),
  signingKeyAlias = getOidcSigningKeyAlias()
): Promise<Result<string>> => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const jarPayload = {
    iss: config.clientMetadata().client_id,
    aud: config.serverMetadata().issuer,
    response_type: "code",
    client_id: config.clientMetadata().client_id,
    redirect_uri,
    scope: scope.join(" "), // scopes are space seperated
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    iat: nowInSeconds,
    nbf: nowInSeconds,
    exp: nowInSeconds + 300, // + 5 mins
  };

  const signedJarResult = await Result.flatTryAsync(() =>
    signRequestWithKms(
      jarPayload,
      signingKeyAlias,
      { typ: "application/oauth-authz-req+jwt" } // see here: https://www.rfc-editor.org/info/rfc9101/
    )
  );

  return signedJarResult;
};
