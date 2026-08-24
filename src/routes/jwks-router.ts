import { KMS, GetPublicKeyCommand } from "@aws-sdk/client-kms";
import express from "express";
import { createHash } from "crypto";
import { JWK, importSPKI, exportJWK } from "jose";
import { PATH_NAMES } from "../app.constants.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

const kmsClient = new KMS({
  region: "eu-west-2",
});

const getKeyFromKms = async (): Promise<JWK> => {
  logger.info("Fetching signing key from KMS");

  const { PublicKey, KeyId } = await kmsClient.send(
    new GetPublicKeyCommand({ KeyId: process.env.OIDC_SIGNING_KEY_ALIAS })
  );

  if (!PublicKey || !KeyId) {
    throw new Error("No key found");
  }
  const b64 = Buffer.from(PublicKey).toString("base64");
  const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
  const cryptoKey = await importSPKI(pem, "ES256");
  const jwk = await exportJWK(cryptoKey);
  jwk.kid = createHash("SHA256").update(KeyId, "utf8").digest("hex");
  jwk.alg = "ES256";
  return jwk;
};

let oidcSigningJwk: JWK;

router.get(PATH_NAMES.OIDC_JWKS, async (req, res, next) => {
  try {
    if (!oidcSigningJwk) {
      oidcSigningJwk = await getKeyFromKms();
    }
    res.json({
      keys: [oidcSigningJwk],
    });
  } catch (err) {
    next(err);
  }
});

export { router as jwksRouter };
