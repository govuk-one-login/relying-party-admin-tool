import { CoreClientConfig } from "../../@types/express/index.js";
import { getIntegrationClientMaxRateLimit } from "../config.js";
import {
  ClientRegistryApiClientInput,
  ClientRegistryApiClientResponse,
} from "../models/api.js";
import { Claim, LevelOfConfidence, Scope } from "../models/client.js";
import { Result } from "../models/result.js";
import { ClientRegistryStorage } from "../ports/client-registry-storage.js";
import { logger } from "../utils/logger.js";

export class ClientRegistryService {
  private storageService: ClientRegistryStorage;

  constructor(storageService: ClientRegistryStorage) {
    this.storageService = storageService;
  }

  public async addClientToClientRegistry(
    newClientConfig: CoreClientConfig,
    serviceId: string
  ): Promise<Result<ClientRegistryApiClientResponse>> {
    const apiRequest = this.convertCoreConfigToApiRequest(
      newClientConfig,
      serviceId
    );
    const clientResponse = await this.storageService.addClient(apiRequest);

    if (!clientResponse.success) {
      logger.error(
        { err: clientResponse.error },
        "Failed to create request in Client Registry"
      );
      return Result.failure(clientResponse.error);
    }
    return clientResponse;
  }

  private convertCoreConfigToApiRequest = (
    config: CoreClientConfig,
    serviceId: string
  ): ClientRegistryApiClientInput => {
    const apiRequest: Partial<ClientRegistryApiClientInput> = {
      // defaults
      oneLoginService: false,
      idTokenSigningAlgorithm: "ES256",
      smokeTest: false,
      permitMissingNonce: false,
      channel: "web",
      clientType: "web",
      maxAgeEnabled: false,
      pkceEnforced: false,
      rateLimit: getIntegrationClientMaxRateLimit(),
      subjectType: "pairwise",
      isActive: true,
      isDeprecated: false,
      cookieConsentShared: false,
      testClient: false,
      jarValidationRequired: false,
      serviceType: "MANDATORY",
      postLogoutRedirectUrls: [],

      // Fields from config
      clientName: config.clientName!,
      redirectUrls: config.redirectUrls!,
      //TODO: fix types
      clientLoCs: (config.loc as LevelOfConfidence[]) || [],
      identityVerificationSupported:
        config.isIdentityVerificationSupported || false,
      //TODO: fix types
      claims: (config.claims as Claim[]) || [],
      landingPageUrl: config.landingPageUrl,
      //TODO: fix types
      scopes: config.scopes as Scope[],
      serviceIntegrationId: serviceId,
      sectorIdentifierUri: "https://example.com/", // TODO: We need to collect the sector identifier in the create flow
    };

    if (config.clientAuthenticationMethod === "STATIC") {
      apiRequest.clientTokenAuthMethod = {
        tokenAuthMethod: "private_key_jwt",
      };
      apiRequest.clientJwtPublicKeySource = {
        type: "STATIC",
        jwks: [
          //TODO: Figure out how we handle key stuff
        ],
      };
    } else if (config.clientAuthenticationMethod === "JWKS") {
      apiRequest.clientTokenAuthMethod = {
        tokenAuthMethod: "private_key_jwt",
      };
      apiRequest.clientJwtPublicKeySource = {
        type: "JWKS",
        jwksUrl: config.jwksURL!,
      };
    } else if (config.clientAuthenticationMethod === "CLIENT_SECRET") {
      apiRequest.clientTokenAuthMethod = {
        tokenAuthMethod: "client_secret_post",
        clientSecret: config.clientSecret!, // TODO: This should be a client secret hash
      };
    }
    return apiRequest as ClientRegistryApiClientInput;
  };
}
