import { randomBytes } from "node:crypto";
import { InMemoryClientStorage } from "../adapters/in-memory-client-storage.js";
import { ClientRegistryStorage } from "../ports/client-registry-storage.js";
import {
  generateClientRegistryInput,
  generateTestCoreClientConfig,
} from "../utils/test-utils/test-client-generator.js";
import { ClientRegistryService } from "./client-registry-service.js";
import { Result, Success } from "../models/result.js";
import { ClientRegistryApiClientResponse } from "../models/api.js";

const testClientId = "KVQPnJ13Yf-hWc0_OFUflfLBOI4FG1zN24PXYPDpQuI"; //pragma: allowlist secret

vi.mock(import("node:crypto"), () => {
  return { randomBytes: vi.fn(() => Buffer.from(testClientId, "base64url")) };
});

describe("client registry service tests", () => {
  let clientRepository: ClientRegistryStorage;
  const FIXED_TIMESTAMP = "2026-10-27T12:00:00.000Z";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_TIMESTAMP));
    clientRepository = new InMemoryClientStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("converts a JWKS client to the expected format, stores it and returns the output", async () => {
    // arrange
    const serviceId = randomBytes(32).toString("base64url");
    const config = generateTestCoreClientConfig({
      jwksURL: "https://example.com",
      clientAuthenticationMethod: "JWKS",
      publicKey: undefined,
    });

    const expectedOutput = generateClientRegistryInput({
      clientTokenAuthMethod: {
        tokenAuthMethod: "private_key_jwt",
      },
      clientJwtPublicKeySource: {
        jwksUrl: "https://example.com",
        type: "JWKS",
      },
      clientId: testClientId,
      created: FIXED_TIMESTAMP,
      lastModified: FIXED_TIMESTAMP,
      serviceIntegrationId: serviceId,
    });

    // act
    const clientRegistryApiService = new ClientRegistryService(
      clientRepository
    );
    const response = await clientRegistryApiService.addClientToClientRegistry(
      config,
      serviceId
    );

    //assert
    expect(response).toBeSuccess(expectedOutput);

    const clientId = (response as Success<ClientRegistryApiClientResponse>)
      .value.clientId;
    const client = await clientRepository.getClient(clientId);

    expect(client).toStrictEqual(response);
  });

  it("converts a static public key client to the expected format, stores it and returns the output", async () => {
    // arrange
    const serviceId = randomBytes(32).toString("base64url");
    const config = generateTestCoreClientConfig({
      clientAuthenticationMethod: "STATIC",
    });

    const expectedOutput = generateClientRegistryInput({
      clientTokenAuthMethod: {
        tokenAuthMethod: "private_key_jwt",
      },
      clientJwtPublicKeySource: {
        type: "STATIC",
        jwks: [], // TODO: Consider JWKS
      },
      clientId: testClientId,
      created: FIXED_TIMESTAMP,
      lastModified: FIXED_TIMESTAMP,
      serviceIntegrationId: serviceId,
    });

    // act
    const clientRegistryApiService = new ClientRegistryService(
      clientRepository
    );
    const response = await clientRegistryApiService.addClientToClientRegistry(
      config,
      serviceId
    );

    //assert
    expect(response).toBeSuccess(expectedOutput);

    const clientId = (response as Success<ClientRegistryApiClientResponse>)
      .value.clientId;
    const client = await clientRepository.getClient(clientId);

    expect(client).toStrictEqual(response);
  });

  it("converts a client secret client to the expected format, stores it and returns the output", async () => {
    // arrange
    const serviceId = randomBytes(32).toString("base64url");
    const config = generateTestCoreClientConfig({
      clientAuthenticationMethod: "CLIENT_SECRET",
      clientSecret: "super-secret-secret", // pragma: allowlist secret
      isIdentityVerificationSupported: false,
      landingPageUrl: undefined,
      claims: undefined,
      loc: undefined,
    });

    const expectedOutput = generateClientRegistryInput({
      clientTokenAuthMethod: {
        tokenAuthMethod: "client_secret_post",
        clientSecret: "super-secret-secret", // pragma: allowlist secret
      },
      clientId: testClientId,
      created: FIXED_TIMESTAMP,
      lastModified: FIXED_TIMESTAMP,
      serviceIntegrationId: serviceId,
      identityVerificationSupported: false,
      landingPageUrl: undefined,
      claims: [],
      clientLoCs: [],
    });

    delete expectedOutput["clientJwtPublicKeySource"];

    // act
    const clientRegistryApiService = new ClientRegistryService(
      clientRepository
    );
    const response = await clientRegistryApiService.addClientToClientRegistry(
      config,
      serviceId
    );

    //assert
    expect(response).toBeSuccess(expectedOutput);

    const clientId = (response as Success<ClientRegistryApiClientResponse>)
      .value.clientId;
    const client = await clientRepository.getClient(clientId);

    expect(client).toStrictEqual(response);
  });

  it("returns an error result when the service fails to add a client", async () => {
    // arrange
    const errorStorageService = new InMemoryClientStorage();

    vi.spyOn(errorStorageService, "addClient").mockResolvedValue(
      Result.failure(new Error("an error"))
    );

    const serviceId = randomBytes(32).toString("base64url");
    const config = generateTestCoreClientConfig();

    // act
    const clientRegistryApiService = new ClientRegistryService(
      errorStorageService
    );
    const response = await clientRegistryApiService.addClientToClientRegistry(
      config,
      serviceId
    );

    //assert
    expect(response).toBeFailure();
  });
});
