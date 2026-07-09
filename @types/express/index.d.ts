import "express-session";

declare module "express-session" {
  interface SessionData {
    newClientData?: {
      redirectUrls?: string[];
    };
  }
}
