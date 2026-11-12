import { randomBytes } from "node:crypto";
import { generateJarRequest } from "./generate-jar-auth-request.js";
import { Configuration } from "openid-client";
import { signRequestWithKms } from "./oidc-kms-service.js";
import { Result } from "../models/result.js";

vi.mock(import("./oidc-kms-service.js"), async (importOrignal) => ({
  ...(await importOrignal()),
  signRequestWithKms: vi.fn(),
}));

describe("generateJarRequest tests", () => {
  const fixedUnixTimestamp = 1793808493504;
  const testClientId = "test-client-id";
  const mockJwt =
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.flS92E1rT3_wG8Nsc7K5Y96F7_qD1_M9i2MhCqGg6366jU1g_oA7vJk_Nsc9G21t_w_qM9fF8g2Hk7Y6m_u2Ag"; //pragma: allowlist secret
  const config = new Configuration(
    {
      issuer: "https://oidc.example.com",
    },
    testClientId
  );

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(fixedUnixTimestamp);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a signed JWT result if KMS client returns successfully", async () => {
    // arrange
    vi.mocked(signRequestWithKms).mockResolvedValue(Result.success(mockJwt));
    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const codeChallenge = randomBytes(32).toString("base64url");
    const scope = ["openid"];
    const testRedirectUri = "https://example.com";
    const testSigningAlias = "alias/signing-key";

    // act
    const jarResult = await generateJarRequest(
      config,
      state,
      nonce,
      codeChallenge,
      testRedirectUri,
      scope,
      testSigningAlias
    );

    // assert
    expect(jarResult).toBeSuccess(mockJwt);
    expect(signRequestWithKms).toHaveBeenCalledWith(
      {
        iss: testClientId,
        aud: "https://oidc.example.com",
        response_type: "code",
        client_id: testClientId,
        redirect_uri: testRedirectUri,
        scope: scope[0], // space joined scopes
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        iat: Math.floor(fixedUnixTimestamp / 1000),
        nbf: Math.floor(fixedUnixTimestamp / 1000),
        exp: Math.floor(fixedUnixTimestamp / 1000) + 300,
      },
      testSigningAlias,
      { typ: "application/oauth-authz-req+jwt" }
    );
  });

  it("returns an error when failing to sign the request", async () => {
    // arrange
    const error = new Error("Failed to generate JAR");
    vi.mocked(signRequestWithKms).mockResolvedValue(Result.failure(error));

    const state = randomBytes(32).toString("base64url");
    const nonce = randomBytes(32).toString("base64url");
    const codeChallenge = randomBytes(32).toString("base64url");

    const jarResult = await generateJarRequest(
      config,
      state,
      nonce,
      codeChallenge
    );

    expect(jarResult).toBeFailure(error);
    expect(signRequestWithKms).toHaveBeenCalled();
  });
});
