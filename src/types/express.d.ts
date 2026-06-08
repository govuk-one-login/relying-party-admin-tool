import "express-session";

declare module "express-session" {
  interface SessionData {
    state?: string;
    nonce?: string;
    codeVerifier?: string;
    tokenSet?: Record<string, unknown>;
    user?: Record<string, unknown>;
  }
}
