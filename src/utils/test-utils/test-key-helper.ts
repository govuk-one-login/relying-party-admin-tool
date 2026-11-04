import { generateKeyPairSync, KeyPairExportResult } from "crypto";

export const generateTestEcSigningKeyPair = (): KeyPairExportResult<{
  namedCurve: string;
  publicKeyEncoding: {
    type: "spki";
    format: "der";
  };
  privateKeyEncoding: {
    type: "pkcs8";
    format: "der";
  };
}> => {
  return generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: {
      type: "spki",
      format: "der", // Returns a Buffer
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "der", // Returns a Buffer
    },
  });
};
