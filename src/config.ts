export function getAppEnv(): string {
  return process.env.APP_ENV || "local";
}

export function isLocalEnv(): boolean {
  return getAppEnv() === "local";
}

export function getLogLevel(): string {
  return process.env.LOGS_LEVEL || "debug";
}

export function getVitalSignsIntervalSeconds(): number {
  return Number(process.env.VITAL_SIGNS_INTERVAL_SECONDS) || 10;
}
