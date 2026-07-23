export function getSessionCookieOptions(
  isProdEnv: boolean,
  expiry: number,
  secret: string
): Record<string, unknown> {
  return {
    name: "rpat",
    secret: secret,
    maxAge: expiry,
    signed: true,
    secure: isProdEnv,
  };
}
