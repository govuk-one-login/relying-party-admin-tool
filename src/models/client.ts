import { VALID_TOKEN_SIGNING_ALGS } from "../app.constants.js";

export type ClientSummary = {
  clientId: string;
  name: string;
  env: "production" | "integration";
};

export type IdTokenSigningAlgorithm = (typeof VALID_TOKEN_SIGNING_ALGS)[number];

export interface ClientConfig {
  backchannelLogoutUrl: string;
  idTokenSigningAlgorithm: IdTokenSigningAlgorithm;
  isActive: boolean;
  postLogoutRedirectUrls: string[];
}
