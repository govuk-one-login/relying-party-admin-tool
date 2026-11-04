import {
  GetPublicKeyCommand,
  KMSClient,
  SignCommand,
} from "@aws-sdk/client-kms";
import { mockClient } from "aws-sdk-client-mock";
import { generateTestEcSigningKeyPair } from "../utils/test-utils/test-key-helper.js";
import {
  getPublicKeyInfo,
  hashKeyId,
  signRequestWithKms,
} from "./oidc-kms-service.js";
import { derToJose } from "ecdsa-sig-formatter";
import { Success } from "../models/result.js";

describe("oidc kms service tests", () => {
  const mockKms = mockClient(KMSClient);
  const testKeyId = "a1b2c3d4-5678-90ab-cdef-EXAMPLE11111";
  const mockKeyPair = generateTestEcSigningKeyPair();
  const mockSignatureHex =
    "3045022022718e807380965e90a6e34ee69752cf3a56cf9e26ffbdf7e324c538cb339462022100d072da34f24ef130f1462057ef8c9db66c0d8f079da7db9b61bb1641b9d121dd"; // pragma: allowlist secret

  const withValidPublicKey = () => {
    mockKms
      .on(GetPublicKeyCommand)
      .resolves({ KeyId: testKeyId, PublicKey: mockKeyPair.publicKey });
  };
  const fromBase64Url = (val: string) =>
    JSON.parse(Buffer.from(val, "base64url").toString("utf-8"));

  beforeEach(() => {
    mockKms.reset();
  });

  describe("getPublicKeyInfo", () => {
    it("returns the raw public key and hashedKeyId", async () => {
      // arrange
      withValidPublicKey();

      //act
      const keyOutput = await getPublicKeyInfo(testKeyId);

      // assert
      expect(keyOutput).toBeSuccess({
        rawPublicKey: mockKeyPair.publicKey,
        hashedKeyId: hashKeyId(testKeyId),
      });
    });

    it("returns an error result when the KMS client throws", async () => {
      //arrange
      const error = new Error("Key not found");
      mockKms.on(GetPublicKeyCommand).rejects(error);

      //act
      const keyOutput = await getPublicKeyInfo(testKeyId);

      // assert
      expect(keyOutput).toBeFailure(error);
    });

    it.each([
      { KeyId: undefined, PublicKey: mockKeyPair.publicKey },
      { KeyId: testKeyId, PublicKey: undefined },
    ])(
      "returns an error result when the KMS response does not have a PublicKey or KeyId",
      async (mockKeyResponse) => {
        //arrange
        const error = new Error(
          "No KMS Public Key or KeyId returned from GetPublicKey for signing key: " +
            testKeyId
        );
        mockKms.on(GetPublicKeyCommand).resolves(mockKeyResponse);

        //act
        const keyOutput = await getPublicKeyInfo(testKeyId);

        // assert
        expect(keyOutput).toBeFailure(error);
      }
    );
  });

  describe("signRequestWithKms", () => {
    beforeEach(() => {
      withValidPublicKey();
    });

    it("returns a signed JWT when provided a payload", async () => {
      // arrange
      mockKms.on(SignCommand).resolves({
        Signature: Buffer.from(mockSignatureHex, "hex"),
        KeyId: testKeyId,
      });
      const testPayload = { sub: "user-123" };
      const expectedHeader = { kid: hashKeyId(testKeyId), alg: "ES256" };
      const expectedSignature = derToJose(
        Buffer.from(mockSignatureHex, "hex"),
        "ES256"
      );

      //act
      const signResult = await signRequestWithKms(testPayload, testKeyId);

      expect(signResult).toBeSuccess();

      const [header, payload, sig] = (
        signResult as Success<string>
      ).value.split(".");

      expect(fromBase64Url(header)).toStrictEqual(expectedHeader);
      expect(fromBase64Url(payload)).toStrictEqual(testPayload);
      expect(sig).toStrictEqual(expectedSignature);
    });

    it("returns a signed JWT with additional header values when provided a payload and some extra header params", async () => {
      // arrange
      mockKms.on(SignCommand).resolves({
        Signature: Buffer.from(mockSignatureHex, "hex"),
        KeyId: testKeyId,
      });
      const testPayload = { sub: "user-123" };
      const extraHeaderValues = { typ: "test" };
      const expectedHeader = {
        kid: hashKeyId(testKeyId),
        alg: "ES256",
        ...extraHeaderValues,
      };
      const expectedSignature = derToJose(
        Buffer.from(mockSignatureHex, "hex"),
        "ES256"
      );

      //act
      const signResult = await signRequestWithKms(
        testPayload,
        testKeyId,
        extraHeaderValues
      );

      // assert
      expect(signResult).toBeSuccess();

      const [header, payload, sig] = (
        signResult as Success<string>
      ).value.split(".");

      expect(fromBase64Url(header)).toStrictEqual(expectedHeader);
      expect(fromBase64Url(payload)).toStrictEqual(testPayload);
      expect(sig).toStrictEqual(expectedSignature);
    });

    it("returns an error result when the KMS client throws", async () => {
      // arrange
      const signErr = new Error("Failed to sign request");
      mockKms.on(SignCommand).rejects(signErr);
      const testPayload = { sub: "user-123" };

      //act
      const signResult = await signRequestWithKms(testPayload, testKeyId);

      expect(signResult).toBeFailure(signErr);
    });
  });
});
