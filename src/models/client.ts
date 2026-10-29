import {
  ADDITIONAL_VALID_CHANNELS,
  ADDITIONAL_VALID_SCOPES,
  VALID_CHANNELS,
  VALID_CLAIMS,
  VALID_LOCS,
  VALID_SCOPES,
  VALID_SERVICE_TYPES,
  VALID_TOKEN_SIGNING_ALGS,
} from "../app.constants.js";
import {
  VALID_CLIENT_TYPES,
  VALID_SUBJECT_TYPES,
} from "../scripts/validate-client-registry.js";

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
export type Claim = (typeof VALID_CLAIMS)[number];
export type SubjectType = (typeof VALID_SUBJECT_TYPES)[number];
export type ClientType = (typeof VALID_CLIENT_TYPES)[number];
export type LevelOfConfidence = (typeof VALID_LOCS)[number];

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
