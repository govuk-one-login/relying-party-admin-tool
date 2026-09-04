import "express";
import "express-session";
import { ClientConfig } from "../../src/models/client.ts";

declare global {
  namespace Express {
    export interface Locals {
      scriptNonce?: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
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
  idTokenSigningAlgorithm?: "ES256" | "RS256";
  isActive?: boolean;
};
