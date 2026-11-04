import { allowInsecureRequests, Configuration, discovery } from "openid-client";
import { getOidcBaseUrl, getOidcClientId, isLocalEnv } from "../config.js";
import { kmsClientAuth } from "./kms-client-auth.js";
import { Result } from "../models/result.js";
import { logger } from "../utils/logger.js";
import { oidcCache } from "./oidc-cache.js";

export const getOidcConfig = async (): Promise<Result<Configuration>> => {
  const cacheKey = "oidc-config";
  const value = oidcCache.get<Configuration>(cacheKey);

  if (value) {
    return Result.success(value);
  }

  const getServerMetadataResponse = await Result.tryAsync(() =>
    discovery(
      new URL(getOidcBaseUrl()),
      getOidcClientId(),
      undefined,
      kmsClientAuth,
      {
        // The package blocks HTTP requests, which blocks localhost
        // requests to the discovery endpoint when running locally
        execute: isLocalEnv() ? [allowInsecureRequests] : [],
      }
    )
  );

  if (!getServerMetadataResponse.success) {
    logger.error(getServerMetadataResponse.error);
    return getServerMetadataResponse;
  }

  oidcCache.set<Configuration>(
    cacheKey,
    getServerMetadataResponse.value,
    60 * 60 // cached for 1hr
  );

  return getServerMetadataResponse;
};
