import { CoreClientConfig } from "../../../@types/express/index.js";
import { ClientRegistryApiClientInput } from "../../models/api.js";

export const generateTestCoreClientConfig = (
  overrides: Partial<CoreClientConfig> = {}
): CoreClientConfig => ({
  clientName: "Test Client",
  redirectUrls: ["https://example.com"],
  clientAuthenticationMethod: "STATIC",
  clientTokenAuthenticationMethod: "private_key_jwt",
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl2nA/eEGJJ02opkgnhrs
oW36/OY1TnWYJf286Hd15emB2SsysxmTQQEoUNL7tc3s9UpN3+XAcjKwhApax0ON
aRaHpy0I8m+jSOXKtmmFrPwobo24KeW5Z4yMV74CoB1WnsRLRoDpZaO7Q1HxGDhM
R6+nhdwBLZu5o5pQPKE1Td5u4bhFG/iXG1tk0DKRI2cHnnJaw71crvk/KZoLTlqI
NuA2bJHqW+1XR7z53RNzYupujumjUx+wlOzqU/ehLOiO6EeQIHAVd+Bo4fjn266G
iB4BIXUFBssEd3VLEjo/ZVi7mbUgxDhXK04HkLf8wpR6bCtytXEYgY7Dkc3m3jzq
qQIDAQAB
-----END PUBLIC KEY-----`,
  scopes: ["openid", "email", "phone"],
  isIdentityVerificationSupported: true,
  claims: [
    "https://vocab.account.gov.uk/v1/passport",
    "https://vocab.account.gov.uk/v1/drivingPermit",
    "https://vocab.account.gov.uk/v1/coreIdentityJWT",
    "https://vocab.account.gov.uk/v1/address",
    "https://vocab.account.gov.uk/v1/returnCode",
  ],
  landingPageUrl: "https://example.com/landing-page",
  loc: ["P2"],
  ...overrides,
});

export const generateClientRegistryInput = (
  overrides: Partial<
    ClientRegistryApiClientInput | Record<string, unknown>
  > = {}
): ClientRegistryApiClientInput => ({
  clientName: "Test Client",
  clientJwtPublicKeySource: {
    jwks: [
      {
        alg: "RS256",
        e: "AQAB",
        kty: "RSA",
        n: "l2nA_eEGJJ02opkgnhrsoW36_OY1TnWYJf286Hd15emB2SsysxmTQQEoUNL7tc3s9UpN3-XAcjKwhApax0ONaRaHpy0I8m-jSOXKtmmFrPwobo24KeW5Z4yMV74CoB1WnsRLRoDpZaO7Q1HxGDhMR6-nhdwBLZu5o5pQPKE1Td5u4bhFG_iXG1tk0DKRI2cHnnJaw71crvk_KZoLTlqINuA2bJHqW-1XR7z53RNzYupujumjUx-wlOzqU_ehLOiO6EeQIHAVd-Bo4fjn266GiB4BIXUFBssEd3VLEjo_ZVi7mbUgxDhXK04HkLf8wpR6bCtytXEYgY7Dkc3m3jzqqQ", // pragma: allowlist secret
        kid: "yMqNcdzKa7jYsk2xTI/Vf61PBOyQYsLnsvrzyrfOvMc=", // pragma: allowlist secret
      },
    ],
    type: "STATIC",
  },
  clientTokenAuthMethod: {
    tokenAuthMethod: "private_key_jwt",
  },
  scopes: ["openid", "email", "phone"],
  identityVerificationSupported: true,
  claims: [
    "https://vocab.account.gov.uk/v1/passport",
    "https://vocab.account.gov.uk/v1/drivingPermit",
    "https://vocab.account.gov.uk/v1/coreIdentityJWT",
    "https://vocab.account.gov.uk/v1/address",
    "https://vocab.account.gov.uk/v1/returnCode",
  ],
  landingPageUrl: "https://example.com/landing-page",
  redirectUrls: ["https://example.com"],
  postLogoutRedirectUrls: [],
  serviceType: "MANDATORY",
  sectorIdentifierUri: "https://example.com/",
  subjectType: "pairwise",
  isActive: true,
  isDeprecated: false,
  cookieConsentShared: false,
  testClient: false,
  jarValidationRequired: false,
  clientType: "web",
  oneLoginService: false,
  idTokenSigningAlgorithm: "ES256",
  smokeTest: false,
  clientLoCs: ["P2"],
  permitMissingNonce: false,
  channel: "web",
  maxAgeEnabled: false,
  pkceEnforced: false,
  rateLimit: 50,
  serviceIntegrationId: "test-service-id",
  ...overrides,
});
