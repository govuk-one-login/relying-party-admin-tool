const TABLE_NAME = `${process.env.ENVIRONMENT}-client-registry`;

import { dynamoDocClient } from "../utils/dynamo.js";
import { Invalid, ValidationResult } from "../utils/types.js";
import {
  allChannelsValidator,
  allLevelOfConfidencesValidator,
  allScopesValidator,
  backchannelLogoutUrlValidator,
  clientNameValidator,
  jwksUrlValidator,
  postLogoutRedirectUrlValidator,
  publicKeyValidator,
  redirectUrlValidator,
  sectorIdentifierUriValidator,
  serviceTypeValidator,
  validClaimsValidator,
} from "../validation/shared-client-validators.js";
import {
  listValidator,
  productionUrlValidator,
  requiredValidator,
  validUrlValidator,
} from "../validation/shared-validators.js";
import { optional, rule, when } from "../validation/validator.js";

export const VALID_SCOPES = Object.freeze([
  "openid",
  "phone",
  "email",
  "wallet-subject-id",
  "am",
  "offline_access",
  "govuk-account",
  "doc-checking-app",
] as const);
export type Scope = (typeof VALID_SCOPES)[number];
export const VALID_CLAIMS = Object.freeze([
  "https://vocab.account.gov.uk/v1/passport",
  "https://vocab.account.gov.uk/v1/drivingPermit",
  "https://vocab.account.gov.uk/v1/coreIdentityJWT",
  "https://vocab.account.gov.uk/v1/address",
  "https://vocab.account.gov.uk/v1/returnCode",
] as const);
export type Claim = (typeof VALID_CLAIMS)[number];
export const VALID_SERVICE_TYPES = Object.freeze([
  "MANDATORY",
  "OPTIONAL",
] as const);
export type ServiceType = (typeof VALID_SERVICE_TYPES)[number];
export const VALID_SUBJECT_TYPES = Object.freeze([
  "pairwise",
  "public",
] as const);
export type SubjectType = (typeof VALID_SUBJECT_TYPES)[number];
export const VALID_CLIENT_TYPES = Object.freeze(["web", "app"] as const);
export type ClientType = (typeof VALID_CLIENT_TYPES)[number];
export const VALID_TOKEN_SIGNING_ALGS = Object.freeze([
  "ES256",
  "RS256",
  "RSA256", // TODO Needed to support migration only!
] as const);
export type IdTokenSigningAlgorithm = (typeof VALID_TOKEN_SIGNING_ALGS)[number];
export const VALID_LOCS = Object.freeze(["P0", "P1", "P2", "P3"] as const);
export type LevelOfConfidence = (typeof VALID_LOCS)[number];
export const VALID_CHANNELS = Object.freeze([
  "web",
  "generic_app",
  "strategic_app",
] as const);
export type Channel = (typeof VALID_CHANNELS)[number];

export interface ClientRegistry {
  ClientID: string;
  ClientName: string;
  TokenAuthMethod: string;
  PublicKeySource: string;
  PublicKey?: string;
  JwksUrl?: string;
  ClientSecret?: string;
  Scopes: Scope[];
  RedirectUrls: string[];
  PostLogoutRedirectUrls: string[];
  BackChannelLogoutUri?: string;
  ServiceType: ServiceType;
  SectorIdentifierUri: string;
  SubjectType: SubjectType;
  IsActive: boolean;
  IsDeprecated: boolean;
  CookieConsentShared: boolean;
  TestClient: boolean;
  JarValidationRequired: boolean;
  Claims?: Claim[];
  ClientType: ClientType;
  IdentityVerificationSupported: boolean;
  OneLoginService: boolean;
  IdTokenSigningAlgorithm: IdTokenSigningAlgorithm;
  SmokeTest: boolean;
  LandingPageUrl?: string;
  ClientLoCs: string[];
  PermitMissingNonce: boolean;
  Channel: Channel;
  MaxAgeEnabled: boolean;
  PkceEnforced: boolean;
  RateLimit?: number;
}

export type ClientValidationResult = {
  client: ClientRegistry;
  result: ValidationResult;
};

const fetchClients = async (): Promise<ClientRegistry[]> => {
  return (
    ((
      await dynamoDocClient.scan({
        TableName: TABLE_NAME,
      })
    ).Items as ClientRegistry[]) || []
  );
};

// Extra validations (not yet added to this repo!)
const permitMissingNonceValidator = when(
  (client: ClientRegistry) => client.IdentityVerificationSupported,
  rule(
    (client: ClientRegistry) => !client.PermitMissingNonce,
    "Cannot enable permitMissingNonce if IdentityVerificationSupported is true"
  )
);
const rateLimitValidator = rule(
  (rateLimit?: number) =>
    !rateLimit || (rateLimit > 0 && Math.floor(rateLimit) === rateLimit),
  "rateLimit must be a positive whole number"
).adaptedFrom((client: ClientRegistry) => client.RateLimit);

const clientSecretValidator = when(
  (client: ClientRegistry) => client.TokenAuthMethod === "client_secret_post",
  rule(
    (client: ClientRegistry) => !!client.ClientSecret,
    `tokenAuthMethod is "client_secret_post" but clientSecret was not provided`
  )
).and(
  when(
    (client: ClientRegistry) => client.IdentityVerificationSupported,
    rule(
      (client: ClientRegistry) =>
        client.TokenAuthMethod !== "client_secret_post",
      "Cannot use tokenAuthMethod of client_secret_post with identity enabled"
    )
  )
);
const landingPageUrlValidator = optional(
  validUrlValidator("landing page URL").and(
    productionUrlValidator("landing page URL")
  )
).adaptedFrom((client: ClientRegistry) => client.LandingPageUrl);
// End of temporary validators

export const allValidators = backchannelLogoutUrlValidator
  .adaptedFrom((client: ClientRegistry) => client.BackChannelLogoutUri)
  .and(
    allChannelsValidator.adaptedFrom(
      (client: ClientRegistry) =>
        client.Channel ? client.Channel.toLowerCase() : "web" // TODO: Note that we are defaulting this to "web" here, and considering uppercase values as valid!
    )
  )
  .and(
    clientNameValidator.adaptedFrom(
      (client: ClientRegistry) => client.ClientName
    )
  )
  .and(
    validClaimsValidator.adaptedFrom(
      (client: ClientRegistry) => client.Claims || []
    )
  )
  .and(
    when(
      (client) => client.PublicKeySource === "JWKS",
      jwksUrlValidator.adaptedFrom(
        (client: ClientRegistry) => client.JwksUrl || ""
      )
    )
  )
  .and(
    when(
      (client) => client.PublicKeySource === "STATIC",
      publicKeyValidator
        .adaptedFrom((client: ClientRegistry) =>
          client.PublicKey
            ? `-----BEGIN PUBLIC KEY-----\n${client.PublicKey}\n-----END PUBLIC KEY-----`
            : ""
        )
        .or(
          requiredValidator("Client secret not found").adaptedFrom(
            (client: ClientRegistry) => client.ClientSecret || ""
          )
        )
    )
  )
  .and(
    listValidator(redirectUrlValidator).adaptedFrom(
      (client: ClientRegistry) => client.RedirectUrls || []
    )
  )
  .and(
    allScopesValidator.adaptedFrom(
      (client: ClientRegistry) => client.Scopes || []
    )
  )
  .and(
    when(
      (sectorIdentifierUri) => !!sectorIdentifierUri,
      sectorIdentifierUriValidator
    ).adaptedFrom((client: ClientRegistry) => client.SectorIdentifierUri || "")
  )
  .and(
    serviceTypeValidator.adaptedFrom(
      (client: ClientRegistry) => client.ServiceType || ""
    )
  )
  .and(
    allLevelOfConfidencesValidator.adaptedFrom((client: ClientRegistry) =>
      client.ClientLoCs || client.IdentityVerificationSupported
        ? ["P0", "P2"]
        : ["P0"]
    )
  )
  .and(
    listValidator(postLogoutRedirectUrlValidator).adaptedFrom(
      (client: ClientRegistry) => client.PostLogoutRedirectUrls || []
    )
  )
  .and(permitMissingNonceValidator)
  .and(rateLimitValidator)
  .and(clientSecretValidator)
  .and(landingPageUrlValidator);

fetchClients()
  .then(async (clients) => {
    const validationFailures = (
      await Promise.all(
        clients.map(async (client: ClientRegistry) => {
          return {
            client: client,
            result: await allValidators.validate(client),
          };
        })
      )
    ).filter(
      (resultAndClient: ClientValidationResult) =>
        !resultAndClient.result.isValid
    );

    console.log(
      `Found ${clients.length} clients in ${TABLE_NAME}, with ${validationFailures.length} validation falures.\n`
    );
    let clientIdsString = "";
    validationFailures.forEach((resultAndClient: ClientValidationResult) => {
      const failures = `- ${(resultAndClient.result as Invalid).errors.join("\n- ")}`;
      console.log(
        `Client ID ${resultAndClient.client.ClientID}:\n${failures}\n`
      );
      clientIdsString += resultAndClient.client.ClientID + `\n`;
    });
    console.log("Client IDs with validation failures:");
    console.log(clientIdsString);

    const errorCountMap: Record<string, number> = {};
    validationFailures
      .flatMap(
        (resultAndClient: ClientValidationResult) =>
          (resultAndClient.result as Invalid).errors
      )
      .forEach((error) => {
        errorCountMap[error] = (errorCountMap[error] || 0) + 1;
      });
    console.log("Total error counts:");
    Object.entries(errorCountMap)
      .sort((entry1, entry2) => entry2[1] - entry1[1])
      .forEach((entry) => {
        console.log(`${entry[1]}:\t${entry[0]}`);
      });
  })
  .catch((error) => {
    console.log(
      `Found error: ${(error as Error).message}\n${(error as Error).stack}`
    );
  });
