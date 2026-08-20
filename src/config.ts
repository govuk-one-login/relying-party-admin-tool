import { PRODUCT_PAGE_BASE_URL } from "./app.constants.js";

export const getAppEnv = (): string => {
  return process.env.APP_ENV || "local";
};

export const isLocalEnv = (): boolean => {
  return getAppEnv() === "local";
};

export const isProductionEnv = (): boolean => {
  return process.env.ENVIRONMENT === "production";
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
  return PRODUCT_PAGE_BASE_URL[getAppEnv()] ?? PRODUCT_PAGE_BASE_URL.local;
};
