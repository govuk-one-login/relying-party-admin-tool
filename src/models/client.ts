import {
  ADDITIONAL_VALID_CHANNELS,
  ADDITIONAL_VALID_SCOPES,
  VALID_CHANNELS,
  VALID_SCOPES,
  VALID_SERVICE_TYPES,
  VALID_TOKEN_SIGNING_ALGS,
} from "../app.constants.js";

export type ClientSummary = {
  clientId: string;
  name: string;
  env: "production" | "integration";
};

export type ClientServiceSummary = {
  serviceId: string;
} & ClientSummary;

export type Channel = (
  | typeof VALID_CHANNELS
  | typeof ADDITIONAL_VALID_CHANNELS
)[number];

export type IdTokenSigningAlgorithm = (typeof VALID_TOKEN_SIGNING_ALGS)[number];

export type Scope = (
  | typeof VALID_SCOPES
  | typeof ADDITIONAL_VALID_SCOPES
)[number];

export type ServiceType = (typeof VALID_SERVICE_TYPES)[number];

export interface ClientConfig {
  backchannelLogoutUrl: string;
  channel: Channel;
  clientName: string;
  idTokenSigningAlgorithm: IdTokenSigningAlgorithm;
  isActive: boolean;
  jarValidationRequired: boolean;
  maxAgeEnabled: boolean;
  permitMissingNonce: boolean;
  pkceEnforced: boolean;
  postLogoutRedirectUrls: string[];
  rateLimit?: number;
  redirectUrls: string[];
  scopes: Scope[];
  sectorIdentifierUri: string;
  serviceType: ServiceType;
}
