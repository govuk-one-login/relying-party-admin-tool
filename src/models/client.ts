import {
  VALID_CHANNELS,
  VALID_SERVICE_TYPES,
  VALID_TOKEN_SIGNING_ALGS,
} from "../app.constants.js";

export type ClientSummary = {
  clientId: string;
  name: string;
  env: "production" | "integration";
};

export type Channel = (typeof VALID_CHANNELS)[number];

export type IdTokenSigningAlgorithm = (typeof VALID_TOKEN_SIGNING_ALGS)[number];

export type ServiceType = (typeof VALID_SERVICE_TYPES)[number];

export interface ClientConfig {
  backchannelLogoutUrl: string;
  channel: Channel;
  idTokenSigningAlgorithm: IdTokenSigningAlgorithm;
  isActive: boolean;
  postLogoutRedirectUrls: string[];
  serviceType: ServiceType;
}
