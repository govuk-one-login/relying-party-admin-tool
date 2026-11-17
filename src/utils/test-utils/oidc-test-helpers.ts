import { Configuration, IDToken } from "openid-client";

export const testOidcConfig = (): Configuration => {
  return new Configuration(
    {
      issuer: "http://localhost",
    },
    "test-client-123"
  );
};

export const testIdTokenGenerator = (sub = "test-subject-123"): IDToken => ({
  aud: "test-client-123",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  iss: "http://localhosst",
  sub,
});
