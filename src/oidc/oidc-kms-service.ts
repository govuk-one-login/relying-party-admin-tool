import {
  GetPublicKeyCommand,
  KMSClient,
  SignCommand,
} from "@aws-sdk/client-kms";
import { createHash } from "crypto";
import { getAWSConfig } from "../config/aws.js";
import { Result } from "../models/result.js";
import { logger } from "../utils/logger.js";
import { JoseHeaderParameters } from "jose";
import { derToJose } from "ecdsa-sig-formatter";

const kms = new KMSClient(getAWSConfig());

export const signRequestWithKms = async (
  requestPayload: Record<string, unknown>,
  keyIdOrAlias: string,
  additionalHeaderParams: JoseHeaderParameters = {}
): Promise<Result<string>> => {
  const publicKeyResult = await getPublicKeyInfo(keyIdOrAlias);

  if (!publicKeyResult.success) {
    logger.error(publicKeyResult.error);
    return publicKeyResult;
  }
  const keyInfo = publicKeyResult.value;
  const header = {
    alg: "ES256",
    kid: keyInfo.hashedKeyId,
    ...additionalHeaderParams,
  };
  const signingInput = `${toBase64Url(header)}.${toBase64Url(requestPayload)}`;
  const signingInputBuffer = Buffer.from(signingInput);

  const signingOutput = await Result.tryAsync(() =>
    kms.send(
      new SignCommand({
        KeyId: keyIdOrAlias,
        SigningAlgorithm: "ECDSA_SHA_256",
        MessageType: "RAW",
        Message: signingInputBuffer,
      })
    )
  );

  if (!signingOutput.success) {
    logger.error(
      { error: signingOutput.error },
      "Failed to KMS sign with key:" + keyIdOrAlias
    );
    return signingOutput;
  }

  const parsedSignature = derToJose(
    Buffer.from(signingOutput.value.Signature!),
    "ES256"
  );

  return Result.success(`${signingInput}.${parsedSignature}`);
};

export const getPublicKeyInfo = async (
  keyIdOrAlias: string
): Promise<
  Result<{
    rawPublicKey: Uint8Array<ArrayBufferLike>;
    hashedKeyId: string;
  }>
> => {
  const publicKeyResult = await Result.tryAsync(() =>
    kms.send(new GetPublicKeyCommand({ KeyId: keyIdOrAlias }))
  );

  if (!publicKeyResult.success) {
    logger.error(
      { error: publicKeyResult.error },
      "Failed to retrieve OIDC signing public key for signing key:" +
        keyIdOrAlias
    );
    return publicKeyResult;
  }

  const { PublicKey, KeyId } = publicKeyResult.value;

  if (!PublicKey || !KeyId) {
    logger.error(
      "No KMS Public Key or KeyId returned from GetPublicKey for signing key: " +
        keyIdOrAlias
    );
    return Result.failure(
      new Error(
        "No KMS Public Key or KeyId returned from GetPublicKey for signing key: " +
          keyIdOrAlias
      )
    );
  }

  return Result.success({
    rawPublicKey: PublicKey,
    hashedKeyId: hashKeyId(KeyId),
  });
};

export const hashKeyId = (keyId: string): string =>
  createHash("sha256").update(keyId, "utf8").digest("hex");

export const toBase64Url = (payload: Record<string, unknown>): string =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");
