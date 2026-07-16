import "express-session";

declare module "express-session" {
  interface SessionData {
    newClientData?: {
      name?: string;
      redirectUrls?: string[];
    };
  }
}
