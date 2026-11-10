import { Configuration } from "openid-client";
import { getOidcConfig } from "../oidc/oidc-client.js";
import { generateJarRequest } from "./../oidc/generate-jar-auth-request.js";
import { Result } from "../models/result.js";
import { mockResponse, RequestBuilder } from "../utils/test-utils/builders.js";
import { checkAuthMiddleware } from "./check-auth-middleware.js";
import { PATH_NAMES } from "../app.constants.js";

vi.mock(import("./../oidc/oidc-client.js"), () => ({
  getOidcConfig: vi.fn(),
}));

vi.mock(import("./../oidc/generate-jar-auth-request.js"), () => ({
  generateJarRequest: vi.fn(),
}));

describe("check auth middleware tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const exampleIssuer = "https://oidc.example.com";
  const authorizeEndpoint = `${exampleIssuer}/authorize`;
  const testClientId = "test-client-id";
  const config = new Configuration(
    {
      issuer: exampleIssuer,
      authorization_endpoint: authorizeEndpoint,
    },
    testClientId
  );
  const mockJwt =
    "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.flS92E1rT3_wG8Nsc7K5Y96F7_qD1_M9i2MhCqGg6366jU1g_oA7vJk_Nsc9G21t_w_qM9fF8g2Hk7Y6m_u2Ag"; //pragma: allowlist secret

  it("calls next if the user is authenticated and has a userId on their session", async () => {
    // arrange
    const req = new RequestBuilder()
      .withSession({ isAuthenticated: true, userId: "user123" })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await checkAuthMiddleware(req, res, next);

    //assert
    expect(next).toHaveBeenCalled();
    expect(getOidcConfig).not.toHaveBeenCalled();
    expect(generateJarRequest).not.toHaveBeenCalled();
  });

  it.each([
    {
      isAuthenticated: false,
      userId: "user123",
    },
    {
      userId: "user123",
    },
    {
      isAuthenticated: true,
      userId: "",
    },
    {
      isAuthenticated: true,
    },
    {
      isAuthenticated: false,
    },
    {},
  ])(
    "redirects the user to the authorization server if unauthenticated",
    async (sessionData) => {
      // arrange
      vi.mocked(getOidcConfig).mockResolvedValue(Result.success(config));
      vi.mocked(generateJarRequest).mockResolvedValue(Result.success(mockJwt));
      const req = new RequestBuilder().withSession(sessionData).build();
      const res = mockResponse();
      const next = vi.fn();

      // act
      await checkAuthMiddleware(req, res, next);

      // assert
      expect(res.redirect).toHaveBeenCalledWith(
        `${authorizeEndpoint}?request=${mockJwt}&client_id=${testClientId}`
      );
      expect(req.session.codeVerifier).toBeDefined();
      expect(req.session.state).toBeDefined();
      expect(req.session.nonce).toBeDefined();
    }
  );

  it("sends the user to the 500 error page if it fails to fetch the OIDC config", async () => {
    // arrange
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.failure(new Error("Error getting oidc config"))
    );
    const req = new RequestBuilder().withSession({}).build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await checkAuthMiddleware(req, res, next);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(generateJarRequest).not.toHaveBeenCalled();
    expect(req.session.codeVerifier).toBeUndefined();
    expect(req.session.state).toBeUndefined();
    expect(req.session.nonce).toBeUndefined();
  });

  it("sends the user to the 500 error page if it fails to generate the JAR", async () => {
    // arrange
    vi.mocked(getOidcConfig).mockResolvedValue(Result.success(config));
    vi.mocked(generateJarRequest).mockResolvedValue(
      Result.failure(new Error("Failed to create JAR"))
    );
    const req = new RequestBuilder().withSession({}).build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await checkAuthMiddleware(req, res, next);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.codeVerifier).toBeUndefined();
    expect(req.session.state).toBeUndefined();
    expect(req.session.nonce).toBeUndefined();
  });
});
