import { JWK } from "jose";
import {
  Channel,
  IdTokenSigningAlgorithm,
  Scope,
  ServiceType,
  Claim,
  ClientType,
  LevelOfConfidence,
  SubjectType,
} from "./client.js";

export type JwksPublicKeySource = {
  type: "JWKS";
  jwksUrl: string;
};
export type StaticPublicKeySource = {
  type: "STATIC";
  jwks: JWK[];
};
export type ClientJwtPublicKeySource =
  | JwksPublicKeySource
  | StaticPublicKeySource;

export type PrivateKeyJwtAuth = {
  tokenAuthMethod: "private_key_jwt";
};
export type ClientSecretPostAuth = {
  tokenAuthMethod: "client_secret_post";
  clientSecret: string;
};
export type ClientTokenAuthMethod = PrivateKeyJwtAuth | ClientSecretPostAuth;

export type ClientRegistryApiClientInput = {
  clientName: string;
  clientJwtPublicKeySource?: ClientJwtPublicKeySource;
  clientTokenAuthMethod: ClientTokenAuthMethod;
  scopes: Scope[];
  redirectUrls: string[];
  postLogoutRedirectUrls: string[];
  backChannelLogoutUri?: string;
  serviceType: ServiceType;
  sectorIdentifierUri: string;
  subjectType: SubjectType;
  isActive: boolean;
  isDeprecated: boolean;
  cookieConsentShared: boolean;
  testClient: boolean;
  jarValidationRequired: boolean;
  claims: Claim[];
  clientType: ClientType;
  identityVerificationSupported: boolean;
  oneLoginService: boolean;
  idTokenSigningAlgorithm: IdTokenSigningAlgorithm;
  smokeTest: boolean;
  landingPageUrl?: string;
  clientLoCs: LevelOfConfidence[];
  permitMissingNonce: boolean;
  channel: Channel;
  maxAgeEnabled: boolean;
  pkceEnforced: boolean;
  rateLimit?: number;
  organisationId?: string;
  serviceIntegrationId: string;
};

export type ClientRegistryApiClientResponse = ClientRegistryApiClientInput & {
  clientId: string;
  created: string;
  lastModified: string;
};

export type HTTPMethods = "GET" | "POST" | "PUT";

export type ReadWriteApiPaths = "clients" | `clients/${string}`;

export type HTTPFailure = {
  statusCode: number;
  responseText: string;
  responseHeaders: Headers;
};
