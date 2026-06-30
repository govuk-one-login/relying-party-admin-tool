export const PATH_NAMES = {
  ROOT: "/",
  HEALTHCHECK: "/healthcheck",
  SERVICES: "/services",
  CREATE_SERVICE: "/services/create",
  SERVICE: "/services/:serviceId",
  CREATE_CLIENT: "/services/:serviceId/clients/create",
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
