import { randomUUID } from "crypto";
import { ClientMetadata, ServerMetadata } from "openid-client";
import { getOidcSigningKeyAlias } from "../config.js";
import { signRequestWithKms } from "./oidc-kms-service.js";

export const kmsClientAuth = async (
  authServerMetaData: ServerMetadata,
  clientMetadata: ClientMetadata,
  requestBody: URLSearchParams
): Promise<void> => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const jwt = {
    iss: clientMetadata.client_id,
    sub: clientMetadata.client_id,
    aud: authServerMetaData.token_endpoint,
    jti: randomUUID(),
    iat: nowInSeconds,
    exp: nowInSeconds + 300,
  };

  const clientAssertion = await signRequestWithKms(
    jwt,
    getOidcSigningKeyAlias(),
    { typ: "client-authentication+jwt" }
  );

  if (!clientAssertion.success) {
    throw new Error("Failed to create client assertion", {
      cause: clientAssertion.error,
    });
  }

  requestBody.set("client_id", clientMetadata.client_id);
  requestBody.set(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
  );
  requestBody.set("client_assertion", clientAssertion.value);
};
