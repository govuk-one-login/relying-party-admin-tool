import { ClientMetadata, ServerMetadata } from "openid-client";
import { signRequestWithKms } from "./oidc-kms-service.js";
import { Result } from "../models/result.js";
import { kmsClientAuth } from "./kms-client-auth.js";

vi.mock(import("./oidc-kms-service.js"), () => ({
  signRequestWithKms: vi.fn(),
}));

describe("kmsClientAuth tests", () => {
  const fixedUnixTimestamp = 1793808493504;
  const mockAuthServerMetadata: ServerMetadata = {
    issuer: "https://oidc.example.com",
    token_endpoint: "https://oidc.example.com/token",
  };
  const mockClientMetadata: ClientMetadata = { client_id: "test-client-123" };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(fixedUnixTimestamp);
  });

  it("calls signRequestWithKms and adds the relevant fields to the request body", async () => {
    // arrange
    const mockReqParams = new URLSearchParams();
    const mockJwt =
      "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.flS92E1rT3_wG8Nsc7K5Y96F7_qD1_M9i2MhCqGg6366jU1g_oA7vJk_Nsc9G21t_w_qM9fF8g2Hk7Y6m_u2Ag"; //pragma: allowlist secret
    vi.mocked(signRequestWithKms).mockResolvedValue(Result.success(mockJwt));

    // act
    await kmsClientAuth(
      mockAuthServerMetadata,
      mockClientMetadata,
      mockReqParams
    );

    // assert
    expect(mockReqParams.get("client_id")).toStrictEqual(
      mockClientMetadata.client_id
    );
    expect(mockReqParams.get("client_assertion_type")).toBe(
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
    );
    expect(mockReqParams.get("client_assertion")).toStrictEqual(mockJwt);

    expect(signRequestWithKms).toHaveBeenCalledWith(
      {
        iss: mockClientMetadata.client_id,
        sub: mockClientMetadata.client_id,
        aud: mockAuthServerMetadata.token_endpoint,
        jti: expect.any(String),
        iat: Math.floor(fixedUnixTimestamp / 1000),
        exp: Math.floor(fixedUnixTimestamp / 1000) + 300,
      },
      "alias/local-oidc-signing-key-alias",
      { typ: "client-authentication+jwt" }
    );
  });

  it("throws an error if signRequestWithKms returns a failure, and attaches the error as a cause", async () => {
    // arrange
    const kmsErr = new Error("Failed to get key from KMS");
    vi.mocked(signRequestWithKms).mockResolvedValue(Result.failure(kmsErr));
    const mockReqParams = new URLSearchParams();

    // act
    await expect(() =>
      kmsClientAuth(mockAuthServerMetadata, mockClientMetadata, mockReqParams)
    ).rejects.toThrow(
      new Error("Failed to create client assertion", {
        cause: kmsErr,
      })
    );
  });
});
