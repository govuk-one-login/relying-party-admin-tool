import { PRODUCT_PAGE_BASE_URL } from "./app.constants.js";

export const getEnv = (): string => {
  return process.env.ENVIRONMENT || "local";
};

export const isLocalEnv = (): boolean => {
  return getEnv() === "local";
};

export const isProductionEnv = (): boolean => {
  return getEnv() === "production";
};

export const getLogLevel = (): string => {
  return process.env.LOGS_LEVEL || "debug";
};

export const getVitalSignsIntervalSeconds = (): number => {
  return Number(process.env.VITAL_SIGNS_INTERVAL_SECONDS) || 10;
};

export const getSessionSecret = (): string => {
  return process.env.SESSION_SECRET || "";
};

export const getSessionExpiry = (): number => {
  return Number(process.env.SESSION_EXPIRY);
};

export const getProductPagesBaseUrl = (): string => {
  return PRODUCT_PAGE_BASE_URL[getEnv()] ?? PRODUCT_PAGE_BASE_URL.local;
};

export const getTestServiceId = (): string | undefined => {
  return process.env.TEST_SERVICE_ID;
};

export function getAwsRegion(): string {
  return process.env.AWS_REGION ?? "eu-west-2";
}

export function getDynamoDBLocalBaseUrl(): string {
  return process.env.DYNAMO_ENDPOINT ?? "http://127.0.0.1:8001";
}
