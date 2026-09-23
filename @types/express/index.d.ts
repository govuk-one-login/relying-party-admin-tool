import "express";
import "express-session";
import { ClientConfig } from "../../src/models/client.ts";
import { logger } from "../../src/utils/logger";

declare global {
  namespace Express {
    export interface Locals {
      scriptNonce?: string;
    }

    export interface Request {
      log: logger;
      csrfToken?: () => string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    newClientConfig?: CoreClientConfig;
    changedClientConfig?: CoreClientConfig & AdditionalClientConfig;
    currentClientConfig: ClientConfig;
  }
}

type CoreClientConfig = {
  name?: string;
  redirectUrls?: string[];
  clientAuthenticationMethod?: "JWKS" | "STATIC" | "CLIENT_SECRET";
  clientTokenAuthenticationMethod?: "private_key_jwt" | "client_secret_post";
  clientSecret?: string;
  jwksURL?: string;
  publicKey?: string;
  scopes?: string[];
  isIdentityVerificationSupported?: boolean;
  claims?: string[];
  landingPageUrl?: string;
};

type AdditionalClientConfig = {
  backchannelLogoutUrl?: string;
  channel?: "web" | "generic_app" | "strategic_app";
  idTokenSigningAlgorithm?: "ES256" | "RS256";
  isActive?: boolean;
  jarValidationRequired?: boolean;
  pkceEnforced?: boolean;
  postLogoutRedirectUrls?: string[];
  sectorIdentifierUri?: string;
  serviceType?: "OPTIONAL" | "MANDATORY";
};
