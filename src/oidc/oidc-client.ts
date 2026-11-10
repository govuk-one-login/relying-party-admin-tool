import { allowInsecureRequests, Configuration, discovery } from "openid-client";
import { getOidcBaseUrl, getOidcClientId, isLocalEnv } from "../config.js";
import { kmsClientAuth } from "./kms-client-auth.js";
import { Result } from "../models/result.js";
import { logger } from "../utils/logger.js";
import { oidcCache } from "./oidc-cache.js";

export const configCacheKey = "oidc-config";
export const getOidcConfig = async (
  config = {
    baseUrl: getOidcBaseUrl(),
    clientId: getOidcClientId(),
  }
): Promise<Result<Configuration>> => {
  const value = oidcCache.get<Configuration>(configCacheKey);

  if (value) {
    return Result.success(value);
  }

  const getServerMetadataResponse = await Result.tryAsync(() =>
    discovery(
      new URL(config.baseUrl),
      config.clientId,
      undefined,
      kmsClientAuth,
      {
        // The package blocks HTTP requests, which blocks localhost
        // requests to the discovery endpoint when running locally
        execute: isLocalEnv() ? [allowInsecureRequests] : [],
        timeout: 5, // Timeout of 5 seconds, default is 30
      }
    )
  );

  if (!getServerMetadataResponse.success) {
    logger.error(getServerMetadataResponse.error);
    return getServerMetadataResponse;
  }

  oidcCache.set<Configuration>(
    configCacheKey,
    getServerMetadataResponse.value,
    60 * 60 // cached for 1hr
  );

  return getServerMetadataResponse;
};
