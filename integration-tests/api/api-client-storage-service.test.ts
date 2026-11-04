import { setupServer } from "msw/node";
import { delay, http, HttpResponse } from "msw";
import { generateClientRegistryInput } from "../../src/utils/test-utils/test-client-generator.js";
import { ApiClientStorageService } from "../../src/adapters/api-client-storage-service.js";

const testApiUrl = "http://localhost";
const serviceId = "test-service-id";

const server = setupServer(
  http.post(`${testApiUrl}/clients`, () => {
    return HttpResponse.json({
      ...generateClientRegistryInput({
        serviceIntegrationId: serviceId,
      }),
      clientId: "test-client-id",
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    });
  })
);

describe("http client repository integration tests", () => {
  beforeAll(() => {
    server.listen();
    process.env.CLIENT_REGISTRY_READ_WRITE_BASE_URL = testApiUrl;
  });

  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  it("returns the generated client when the request is successful", async () => {
    // arrange
    const httpClientRegistry = new ApiClientStorageService();
    const client = generateClientRegistryInput();

    //act
    const res = await httpClientRegistry.addClient(client);

    // assert
    if (!res.success) {
      assert.fail("Expected Success Response");
    }
    const response = res.value;

    expect(response).toMatchObject({
      ...client,
      clientId: "test-client-id",
      serviceIntegrationId: serviceId,
    });
    expect(response.created).toBeDefined();
    expect(response.lastModified).toBeDefined();
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
    "returns an error for a response with %statusCode",
    async ({ statusCode, text }) => {
      server.use(
        http.post(
          `${testApiUrl}/clients`,
          () => new HttpResponse(text, { status: statusCode })
        )
      );
      // arrange
      const httpClientRegistry = new ApiClientStorageService();
      const client = generateClientRegistryInput();

      //act
      const res = await httpClientRegistry.addClient(client);

      // assert
      if (res.success) {
        assert.fail("Expected Error Response");
      }

      expect(res.error).toStrictEqual(
        new Error("Unsuccessful response from client registry API", {
          cause: {
            statusCode,
            responseText: text,
            responseHeaders: expect.any(Headers),
          },
        })
      );
    }
  );

  it("returns a timeout when the request exceeds the timeout", async () => {
    server.use(
      http.post(`${testApiUrl}/clients`, async () => {
        await delay("infinite");
        HttpResponse.error();
      })
    );
    // arrange
    const httpClientRegistry = new ApiClientStorageService();
    const client = generateClientRegistryInput();

    //act
    const res = await httpClientRegistry.addClient(client);

    // assert
    if (res.success) {
      assert.fail("Expected Failure Response");
    }

    expect(res.error).toStrictEqual(
      new Error(
        "Failed to create client in Client Registry: The operation was aborted due to timeout",
        {
          cause: expect.any(Error),
        }
      )
    );
  }, 6000);

  it("returns an aborted for an unknown error", async () => {
    server.use(http.post(`${testApiUrl}/clients`, () => HttpResponse.error()));
    // arrange
    const httpClientRegistry = new ApiClientStorageService();
    const client = generateClientRegistryInput();

    //act
    const res = await httpClientRegistry.addClient(client);

    // assert
    if (res.success) {
      assert.fail("Expected Error Response");
    }

    expect(res.error).toStrictEqual(
      new Error("Failed to create client in Client Registry: Failed to fetch", {
        cause: expect.any(Error),
      })
    );
  });
});
