import {
  authorizationCodeGrant,
  ClientError,
  TokenEndpointResponse,
  TokenEndpointResponseHelpers,
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

vi.mock(import("./../../oidc/oidc-client.js"), () => ({
  getOidcConfig: vi.fn(),
}));

vi.mock(import("openid-client"), async (importOriginal) => ({
  ...(await importOriginal()),
  authorizationCodeGrant: vi.fn(),
}));

describe("callback controller tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sets the user as authenticated and sets the user ID on the session", async () => {
    vi.mocked(getOidcConfig).mockResolvedValue(
      Result.success(
        new Configuration({ issuer: "http://localhost" }, "test-123")
      )
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

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["SERVICES"]);
    expect(req.session.isAuthenticated).toBe(true);
    expect(req.session.userId).toBe("userId");
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

});
