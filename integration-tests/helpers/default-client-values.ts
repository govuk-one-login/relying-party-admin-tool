export const defaultBaseClientValues = {
  clientName: "Test client",
  redirectUrls: ["https://test.com"],
  scopes: ["openid", "email"],
};

export const defaultJWKSClientValues = {
  clientAuthenticationMethod: "JWKS",
  clientTokenAuthenticationMethod: "private_key_jwt",
  jwksURL: "https://test.com/jwks.json",
};

export const defaultClientSecretClientValues = {
  clientAuthenticationMethod: "CLIENT_SECRET",
  clientTokenAuthenticationMethod: "client_secret_post",
  clientSecret: "test-secret", // pragma: allowlist secret
};

const defaultPublicKeyClientValues = {
  clientAuthenticationMethod: "STATIC",
  clientTokenAuthenticationMethod: "private_key_jwt",
  publicKey:
    "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAluh9PbrQX91wl58R5QBG\n4SYgzR4ZlOL1Fj232nkLrLi/iLCWGLeL9Uil884zb3GcMY7wPhP5HbzXYSM9zxAr\nRdQ94s0mEi6v5Kuz07hF1UBMOCDrGRjSfFGQXx51ZXW8tqPTi6kR1U6F3CC7Qu1B\ny7cQDU6t6dBntEmSHK4mgbEnqL+6+tk/YLQtNZ3+E2HpOPaZIaRcVLpzATTrIqyI\nH5YhK2dQFhau04zPMAc/MLF8mQ1cMtYAbxopY91CsOVcmdni4cZYjquCP+Sx0dGK\nmBL3MQhqiWdmXyFlo1NKyHxn9/5zOP5lAi05dHgqjUC7AoF4nKedq0UbH2uxL72b\nrwIDAQAB\n-----END PUBLIC KEY-----", // pragma: allowlist secret
};

export const defaultIdentityVerificationSupportedClientValues = {
  isIdentityVerificationSupported: true,
  claims: [],
  landingPageUrl: "https://test.com/landing-page",
  loc: ["P2"],
};

export const defaultIdentityVerificationNotSupportedClientValues = {
  isIdentityVerificationSupported: false,
  loc: ["P0"],
};
