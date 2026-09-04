export const PATH_NAMES = {
  ROOT: "/",
  "500_ERROR": "/error",
  HEALTHCHECK: "/healthcheck",
  SERVICES: "/services",
  CREATE_SERVICE: "/services/create",
  SERVICE: "/services/:serviceId",
  CLIENT: "/services/:serviceId/clients/:clientId",
  CREATE_CLIENT: "/services/:serviceId/clients/create",
  CREATE_CLIENT_ENTER_CLIENT_NAME:
    "/services/:serviceId/clients/create/enter-client-name",
  CREATE_CLIENT_EDIT_CLIENT_NAME:
    "/services/:serviceId/clients/create/edit-client-name",
  CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION:
    "/services/:serviceId/clients/create/select-client-authentication",
  CREATE_CLIENT_EDIT_CLIENT_AUTHENTICATION:
    "/services/:serviceId/clients/create/edit-client-authentication",
  CREATE_CLIENT_ENTER_REDIRECT_URLS:
    "/services/:serviceId/clients/create/enter-redirect-urls",
  CREATE_CLIENT_EDIT_REDIRECT_URLS:
    "/services/:serviceId/clients/create/edit-redirect-urls",
  CREATE_CLIENT_SELECT_SCOPES:
    "/services/:serviceId/clients/create/select-scopes",
  CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT:
    "/services/:serviceId/clients/create/support-identity-verification",
  CREATE_CLIENT_SELECT_CLAIMS:
    "/services/:serviceId/clients/create/select-claims",
  CREATE_CLIENT_ENTER_LANDING_PAGE_URL:
    "/services/:serviceId/clients/create/enter-landing-page-url",
  CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE:
    "/services/:serviceId/clients/create/select-levels-of-confidence",
  CREATE_CLIENT_SUMMARY: "/services/:serviceId/clients/create/summary",
  CREATE_CLIENT_SUCCESS: "/services/:serviceId/clients/create/success",
  CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL:
    "/services/:serviceId/clients/:clientId/edit-backchannel-logout-url",
  CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM:
    "/services/:serviceId/clients/:clientId/edit-id-token-signing-algorithm",
  CLIENT_EDIT_IS_ACTIVE:
    "/services/:serviceId/clients/:clientId/edit-is-active",
  OIDC_JWKS: "/.well-known/jwks.json",
};

export const HTTP_STATUS_CODES = {
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  OK: 200,
  NO_CONTENT: 204,
  REDIRECT: 303,
};

export const PRODUCT_PAGE_BASE_URL: Record<string, string> = {
  local: "http://localhost:3000",
  dev: "https://development.sign-in.service.gov.uk",
  build: "https://build.sign-in.service.gov.uk",
  staging: "https://staging.sign-in.service.gov.uk",
  integration: "https://integration.sign-in.service.gov.uk",
  production: "https://sign-in.service.gov.uk",
};

export const PROHIBITED_REDIRECT_URI_SCHEMES: string[] = [
  "data",
  "javascript",
  "vbscript",
];

export const PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES: string[] = [
  "code",
  "state",
  "response",
];

export const VALID_CLAIMS = Object.freeze([
  "https://vocab.account.gov.uk/v1/passport",
  "https://vocab.account.gov.uk/v1/drivingPermit",
  "https://vocab.account.gov.uk/v1/coreIdentityJWT",
  "https://vocab.account.gov.uk/v1/address",
  "https://vocab.account.gov.uk/v1/returnCode",
] as const);

export const VALID_SCOPES = Object.freeze([
  "openid",
  "phone",
  "email",
  "wallet-subject-id",
  "am",
  "doc-checking-app",
  "govuk-account",
  "offline_access",
] as const);

export const VALID_TOKEN_SIGNING_ALGS = Object.freeze([
  "ES256",
  "RS256",
] as const);
