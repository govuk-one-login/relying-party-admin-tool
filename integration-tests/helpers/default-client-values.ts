export const defaultBaseClientValues = {
  name: "Test client",
  redirectUrls: ["https://test.com"],
  scopes: ["openid", "email"],
};

const defaultJWKSClientValues = {
  clientAuthenticationMethod: "JWKS",
  clientTokenAuthenticationMethod: "private_key_jwt",
  jwksURL: "https://test.com/jwks.json",
};

const defaultClientSecretClientValues = {
  clientAuthenticationMethod: "CLIENT_SECRET",
  clientTokenAuthenticationMethod: "client_secret_post",
  clientSecret: "test-secret", // pragma: allowlist secret
};

const defaultPublicKeyClientValues = {
  clientAuthenticationMethod: "STATIC",
  clientTokenAuthenticationMethod: "private_key_jwt",
  publicKey:
    "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQk36HYw2tjwb1H88zL3dfPu2X\ngG7svnZgC660jop/Fi49dOOC8uX7u5WuaQP/ncUMHpR1M+av1bCn1NERXYyZ0TLO\nARZOO8fY5gJ5lLbQBngSUiSTTzjAZcQtypjosFLRkEyIMcXQxFc3Dk42mfhJiRFl\nffrIxtcLe1nxq4dRDQIDAQAB\n-----END PUBLIC KEY-----", // pragma: allowlist secret
};

const defaultIdentityVerificationSupportedClientValues = {
  isIdentityVerificationSupported: true,
  claims: [],
  landingPageUrl: "https://test.com/landing-page",
  loc: ["P2"],
};

const defaultIdentityVerificationNotSupportedClientValues = {
  isIdentityVerificationSupported: false,
};
