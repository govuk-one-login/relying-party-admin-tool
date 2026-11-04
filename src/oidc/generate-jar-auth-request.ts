import { Configuration } from "openid-client";
import { getOidcCallbackUrl, getOidcSigningKeyAlias } from "../config.js";
import { signRequestWithKms } from "./oidc-kms-service.js";
import { Result } from "../models/result.js";

export const generateJarRequest = async (
  config: Configuration,
  state: string,
  nonce: string,
  codeChallenge: string
): Promise<Result<string>> => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const jarPayload = {
    iss: config.clientMetadata().client_id,
    aud: config.serverMetadata().issuer,
    response_type: "code",
    client_id: config.clientMetadata().client_id,
    redirect_uri: getOidcCallbackUrl(),
    scope: "openid", // TODO configure client scopes
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    iat: nowInSeconds,
    exp: nowInSeconds + 300, // + 5 mins
  };

  const signedJarResult = await Result.flatTryAsync(() =>
    signRequestWithKms(
      jarPayload,
      getOidcSigningKeyAlias(),
      { typ: "application/oauth-authz-req+jwt" } // see here: https://www.rfc-editor.org/info/rfc9101/
    )
  );

  if (!signedJarResult.success) {
    return signedJarResult;
  }
  return signedJarResult;
};
