import "express";
import "express-session";

declare global {
  namespace Express {
    export interface Locals {
      scriptNonce?: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    newClientData?: {
      name?: string;
      redirectUrls?: string[];
      clientAuthenticationMethod?: "JWKS" | "STATIC" | "CLIENT_SECRET";
    };
  }
}
