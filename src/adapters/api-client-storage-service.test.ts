import { Mock } from "vitest";
import { generateClientRegistryInput } from "../utils/test-utils/test-client-generator.js";
import { ApiClientStorageService } from "./api-client-storage-service.js";
import { ClientRegistryApiClientResponse } from "../models/api.js";

const baseUrl = "http://api.example.com/path";
vi.mock(import("../config.js"), async (importOrignal) => {
  const original = await importOrignal();
  return {
    ...original,
    getClientRegistryBaseUrl: () => baseUrl,
  };
});

describe("api client storage tests", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    fetchMock = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the client response on a successful request", async () => {
    // arrange
    const clientInput = generateClientRegistryInput();
    const expectedResponse: ClientRegistryApiClientResponse = {
      ...clientInput,
      clientId: "test-client-id",
      created: "2026-10-27T16:27:38Z",
      lastModified: "2026-10-27T16:27:38Z",
    };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => expectedResponse,
    });

    // act
    const clientRepository = new ApiClientStorageService();
    const result = await clientRepository.addClient(
      generateClientRegistryInput()
    );

    // assert
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      new URL(`${baseUrl}/clients`),
      {
        body: JSON.stringify(clientInput),
        method: "POST",
        signal: expect.any(AbortSignal),
      }
    );
    expect(result).toBeSuccess(expectedResponse);
  });

  it.each([
    { statusCode: 400, text: "Bad request" },
    { statusCode: 401, text: "Unauthorized" },
    { statusCode: 403, text: "Forbidden" },
    { statusCode: 404, text: "Not Found" },
    {
      statusCode: 500,
      text: "Internal Server Error",
    },
  ])(
    "it returns an error if the API returns a non 200 status code when creating ",
    async ({ statusCode, text }) => {
      const headers = new Headers();
      headers.append("error-code", "1234");

      fetchMock.mockResolvedValue({
        ok: false,
        status: statusCode,
        text: async () => text,
        headers: new Headers(),
      });

      const clientRepository = new ApiClientStorageService();
      const result = await clientRepository.addClient(
        generateClientRegistryInput()
      );

      expect(result).toBeFailure(
        new Error("Unsuccessful response from client registry API", {
          cause: { statusCode, responseText: text, responseHeaders: headers },
        })
      );
    }
  );

  it("returns an error if there is an error when calling fetch", async () => {
    const timeoutError = new Error("Request timed out");
    timeoutError.name = "TimeoutError";
    fetchMock.mockRejectedValue(timeoutError);

    const clientRepository = new ApiClientStorageService();
    const result = await clientRepository.addClient(
      generateClientRegistryInput()
    );

    expect(result).toBeFailure(
      new Error(
        "Failed to create client in Client Registry: Request timed out",
        {
          cause: timeoutError,
        }
      )
    );
  });
});
