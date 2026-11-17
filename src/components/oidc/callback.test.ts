import {
  authorizationCodeGrant,
  ClientError,
  fetchUserInfo,
  TokenEndpointResponse,
  TokenEndpointResponseHelpers,
  UserInfoResponse,
} from "openid-client";
import { PATH_NAMES } from "../../app.constants.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../utils/test-utils/builders.js";
import { callbackController } from "./callback.js";
import { getOidcConfig } from "./../../oidc/oidc-client.js";
import { Result } from "../../models/result.js";
import {
  testIdTokenGenerator,
  testOidcConfig,
} from "../../utils/test-utils/oidc-test-helpers.js";
import { addUser } from "../../datastores/user-permissions-data-store.js";

vi.mock(import("./../../oidc/oidc-client.js"), () => ({
  getOidcConfig: vi.fn(),
}));

vi.mock(import("openid-client"), async (importOriginal) => ({
  ...(await importOriginal()),
  authorizationCodeGrant: vi.fn(),
  fetchUserInfo: vi.fn(),
}));

vi.mock(
  import("../../datastores/user-permissions-data-store.js"),
  async () => ({
    addUser: vi.fn(),
  })
);

describe("callback controller tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sets the user as authenticated and sets the user ID on the session upon a successful callback", async () => {
    const testUserId = "test-user-1234";
    const testEmail = "test@example.com";
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.success(testOidcConfig())
    );

    vi.mocked(authorizationCodeGrant).mockResolvedValue({
      access_token: "access-token-123",
      token_type: "bearer",
      expiresIn: () => 1800,
      id_token: "id-token",
      claims: () => testIdTokenGenerator(testUserId),
    } as TokenEndpointResponse & TokenEndpointResponseHelpers);

    vi.mocked(fetchUserInfo).mockResolvedValue({
      sub: testUserId,
      email: testEmail,
      email_verified: true,
    });

    vi.mocked(addUser).mockResolvedValue();

    const req = new RequestBuilder()
      .withQueryParams({ code: "123", state: "abcd" })
      .withSession({
        state: "abcd",
        codeVerifier: "891011",
        nonce: "4567",
      })
      .build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(addUser).toHaveBeenCalledWith(testUserId, testEmail, "User");
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["SERVICES"]);
    expect(req.session.regenerate).toHaveBeenCalled();
    expect(req.session.isAuthenticated).toBe(true);
    expect(req.session.userId).toBe(testUserId);
  });

  it("redirects to an error page if an error is returned from the OIDC provider", async () => {
    const errors = {
      error: "invalid_request",
      error_description: "Invalid request object",
    };
    const req = new RequestBuilder().withQueryParams(errors).build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.isAuthenticated).toBeUndefined();
    expect(req.session.userId).toBeUndefined();
  });

  it.each([
    { state: "", code: "" },
    {},
    { code: "abcd" },
    { state: "1234" },
    { code: ["1234"], state: "abcd" },
    { code: "abcd", state: ["1234"] },
  ])(
    "redirects to an error page for invalid code or state query params: %s",
    async (qp) => {
      const req = new RequestBuilder()
        .withQueryParams(qp as Record<string, string>)
        .build();
      const res = mockResponse();

      await callbackController(req, res);

      expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
      expect(req.session.isAuthenticated).toBeUndefined();
      expect(req.session.userId).toBeUndefined();
    }
  );

  it.each([
    {
      state: "1234",
      nonce: "5678",
    },
    {
      state: "1234",
      codeVerifier: "891011",
    },
    {
      nonce: "5678",
      codeVerifier: "891011",
    },
  ])(
    "redirects to an error page when the session does not have valid OIDC data: %s",
    async (sessionData) => {
      const req = new RequestBuilder().withSession(sessionData).build();
      const res = mockResponse();

      await callbackController(req, res);

      expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
      expect(req.session.isAuthenticated).toBeUndefined();
      expect(req.session.userId).toBeUndefined();
    }
  );

  it("redirects to an error page if an error page if it fails to get the tokens from the token endpoint", async () => {
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.success(testOidcConfig())
    );
    vi.mocked(authorizationCodeGrant).mockRejectedValue(
      new ClientError("Authorisation code grant expired")
    );

    const req = new RequestBuilder()
      .withQueryParams({ code: "123", state: "abcd" })
      .withSession({
        state: "abcd",
        codeVerifier: "891011",
        nonce: "4567",
      })
      .build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.isAuthenticated).toBeUndefined();
    expect(req.session.userId).toBeUndefined();
  });

  it.each([
    {
      access_token: "1234",
      claims: testIdTokenGenerator,
    },
    {
      id_token: "456",
      claims: testIdTokenGenerator,
    },
    {
      access_token: "1234",
      id_token: "4567",
      claims: () => undefined,
    },
  ])(
    "redirects to an error page if an invalid token response is recieved: %s",
    async (tokenResponse) => {
      vi.mocked(getOidcConfig).mockResolvedValue(
        Result.success(testOidcConfig())
      );

      vi.mocked(authorizationCodeGrant).mockResolvedValue(
        tokenResponse as TokenEndpointResponse & TokenEndpointResponseHelpers
      );

      vi.mocked(fetchUserInfo).mockRejectedValue(
        new ClientError("Invalid access token")
      );

      const req = new RequestBuilder()
        .withQueryParams({ code: "123", state: "abcd" })
        .withSession({
          state: "abcd",
          codeVerifier: "891011",
          nonce: "4567",
        })
        .build();
      const res = mockResponse();

      await callbackController(req, res);

      expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
      expect(req.session.isAuthenticated).toBeUndefined();
      expect(req.session.userId).toBeUndefined();
    }
  );

  it("redirects to an error page if it fails to get the userinfo from the IdP", async () => {
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.success(testOidcConfig())
    );

    vi.mocked(authorizationCodeGrant).mockResolvedValue({
      access_token: "access-token-123",
      token_type: "bearer",
      expiresIn: () => 1800,
      id_token: "id-token",
      claims: testIdTokenGenerator,
    } as TokenEndpointResponse & TokenEndpointResponseHelpers);

    vi.mocked(fetchUserInfo).mockRejectedValue(
      new ClientError("Invalid access token")
    );

    const req = new RequestBuilder()
      .withQueryParams({ code: "123", state: "abcd" })
      .withSession({
        state: "abcd",
        codeVerifier: "891011",
        nonce: "4567",
      })
      .build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.isAuthenticated).toBeUndefined();
    expect(req.session.userId).toBeUndefined();
  });

  it.each([
    {
      sub: "1234",
    },
    {
      email: "test@example.com",
    },
    {
      email_verified: true,
    },
    {
      email: "test@example.com",
      email_verified: true,
    },
    {
      email: "test@example.com",
      sub: "1234",
    },
    {
      email_verified: true,
      sub: "1234",
    },
    {
      email: "test@example.com",
      email_verified: false,
      sub: "1234",
    },
  ])(
    "redirects to an error page for invalid userinfo from the IdP: %s",
    async (userinfo) => {
      vi.mocked(getOidcConfig).mockResolvedValue(
        Result.success(testOidcConfig())
      );

      vi.mocked(authorizationCodeGrant).mockResolvedValue({
        access_token: "access-token-123",
        token_type: "bearer",
        expiresIn: () => 1800,
        id_token: "id-token",
        claims: testIdTokenGenerator,
      } as TokenEndpointResponse & TokenEndpointResponseHelpers);

      vi.mocked(fetchUserInfo).mockResolvedValue(userinfo as UserInfoResponse);

      const req = new RequestBuilder()
        .withQueryParams({ code: "123", state: "abcd" })
        .withSession({
          state: "abcd",
          codeVerifier: "891011",
          nonce: "4567",
        })
        .build();
      const res = mockResponse();

      await callbackController(req, res);

      expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
      expect(req.session.isAuthenticated).toBeUndefined();
      expect(req.session.userId).toBeUndefined();
    }
  );

  it("redirects to an error page when failing to store the user", async () => {
    const testEmail = "test@example.com";
    const testSub = "test-user-123";
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.success(testOidcConfig())
    );

    vi.mocked(authorizationCodeGrant).mockResolvedValue({
      access_token: "access-token-123",
      token_type: "bearer",
      expiresIn: () => 1800,
      id_token: "id-token",
      claims: () => testIdTokenGenerator(testSub),
    } as TokenEndpointResponse & TokenEndpointResponseHelpers);

    vi.mocked(fetchUserInfo).mockResolvedValue({
      email: testEmail,
      email_verified: true,
      sub: testSub,
    });

    vi.mocked(addUser).mockRejectedValue(new Error("Failed to store user"));

    const req = new RequestBuilder()
      .withQueryParams({ code: "123", state: "abcd" })
      .withSession({
        state: "abcd",
        codeVerifier: "891011",
        nonce: "4567",
      })
      .build();
    const res = mockResponse();

    await callbackController(req, res);

    expect(addUser).toHaveBeenCalledWith(testSub, testEmail, "User");
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
    expect(req.session.isAuthenticated).toBeUndefined();
    expect(req.session.userId).toBeUndefined();
  });
});
