import { getClientRegistryBaseUrl } from "../config.js";
import {
  ClientRegistryApiClientInput,
  ClientRegistryApiClientResponse,
  HTTPFailure,
  HTTPMethods,
  ReadWriteApiPaths,
} from "../models/api.js";
import { Result } from "../models/result.js";
import { ClientRegistryStorage } from "../ports/client-registry-storage.js";

export class ApiClientStorageService implements ClientRegistryStorage {
  private static timeoutInMs: number = 5000; // 5 seconds
  private readWriteApiBaseUrl: string;

  constructor() {
    const url = getClientRegistryBaseUrl();
    //ensure we append a / so the stage isn't removed
    this.readWriteApiBaseUrl = url.endsWith("/") ? url : `${url}/`;
  }

  async getClient(
    _ignored: string
  ): Promise<Result<ClientRegistryApiClientResponse | undefined>> {
    throw new Error("Not implemented");
  }

  async addClient(
    clientInput: ClientRegistryApiClientInput
  ): Promise<Result<ClientRegistryApiClientResponse>> {
    const response = await this.sendRequest<ClientRegistryApiClientResponse>(
      "clients",
      "POST",
      clientInput
    );

    if (!response.success) {
      const err = response.error;

      if (err instanceof Error) {
        const errorMessage = `Failed to create client in Client Registry: ${err.message}`;
        return Result.failure(new Error(errorMessage, { cause: err }));
      }

      return Result.failure(
        new Error("Unsuccessful response from client registry API", {
          cause: err,
        })
      );
    }

    return response;
  }

  private async sendRequest<T>(
    path: ReadWriteApiPaths,
    method: HTTPMethods = "GET",
    body: Record<string, unknown> | null = null
  ): Promise<Result<T, HTTPFailure | Error>> {
    const options: RequestInit = {
      method: method,
      signal: AbortSignal.timeout(ApiClientStorageService.timeoutInMs),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = new URL(path, this.readWriteApiBaseUrl);
    const fetchResult = await Result.tryAsync(async () => fetch(url, options));

    if (!fetchResult.success) {
      return fetchResult;
    }

    const httpResponse = fetchResult.value;

    if (!httpResponse.ok) {
      return Result.failure({
        statusCode: httpResponse.status,
        responseText: await httpResponse.text(),
        responseHeaders: httpResponse.headers,
      });
    }

    const jsonParseResponse = await Result.tryAsync<T>(async () =>
      httpResponse.json()
    );

    if (!jsonParseResponse.success) {
      return Result.failure(
        new Error("Invalid JSON from Client Registry API", {
          cause: jsonParseResponse.error,
        })
      );
    }

    return Result.success(jsonParseResponse.value);
  }
}
