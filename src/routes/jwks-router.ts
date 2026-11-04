import express from "express";
import { JWK, importSPKI, exportJWK } from "jose";
import { PATH_NAMES } from "../app.constants.js";
import { logger } from "../utils/logger.js";
import { getOidcSigningKeyAlias } from "../config.js";
import { oidcCache } from "../oidc/oidc-cache.js";
import { Result } from "../models/result.js";
import { getPublicKeyInfo } from "../oidc/oidc-kms-service.js";

const router = express.Router();

const getKeyFromKms = async (): Promise<Result<JWK>> => {
  logger.info("Fetching signing key from KMS");

  const publicKeyResult = await Result.flatTryAsync(() =>
    getPublicKeyInfo(getOidcSigningKeyAlias())
  );

  if (!publicKeyResult.success) {
    return publicKeyResult;
  }
  const { rawPublicKey, hashedKeyId } = publicKeyResult.value;

  const b64 = Buffer.from(rawPublicKey).toString("base64");
  const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
  const cryptoKey = await importSPKI(pem, "ES256");
  const jwk = await exportJWK(cryptoKey);
  jwk.kid = hashedKeyId;
  jwk.alg = "ES256";
  return Result.success(jwk);
};

router.get(PATH_NAMES.OIDC_JWKS, async (_req, res) => {
  const cackeKey = "oidc-client-jwk";
  const cachedJwk = oidcCache.get<JWK>(cackeKey);

  if (cachedJwk) {
    res.json({
      keys: [cachedJwk],
    });
    return;
  }

  const oidcJwkResult = await getKeyFromKms();

  if (!oidcJwkResult.success) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }

  const jwk = oidcJwkResult.value;

  oidcCache.set(cackeKey, jwk, 60 * 10); // cache for 10 mins
  res.json({
    keys: [jwk],
  });
  return;
});

export { router as jwksRouter };
