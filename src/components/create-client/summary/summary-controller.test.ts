import { ClientRegistryService } from "../../../api/client-registry-service.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { addClientToService } from "../../../datastores/services-data-store.js";
import { Result } from "../../../models/result.js";
import { permissionsService } from "../../../services/permissions-service.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../../utils/test-utils/builders.js";
import {
  generateClientRegistryInput,
  generateTestCoreClientConfig,
} from "../../../utils/test-utils/test-client-generator.js";
import {
  createClientSummaryGet,
  createClientSummaryPost,
} from "./summary-controller.js";

vi.mock(import("../../../datastores/services-data-store.js"), () => {
  return {
    addClientToService: vi.fn(),
  };
});

describe("summary controller tests", () => {
  const mockClientRegistryApi = {
    addClientToClientRegistry: vi.fn(),
  } as unknown as ClientRegistryService;

  it("GET renders the summary template with the current client config in the session", async () => {
    // arrange
    const getController = createClientSummaryGet();
    const testServiceId = "test-service-123";
    const client = generateTestCoreClientConfig();
    const req = new RequestBuilder()
      .withSessionNewClientConfig(client)
      .withParams({ serviceId: testServiceId })
      .build();
    const res = mockResponse();

    // act
    await getController(req, res);

    // assert
    expect(res.render).toHaveBeenCalledWith("create-client/summary/index.njk", {
      client,
      baseUrl: populateUrlRoute(PATH_NAMES.CREATE_CLIENT, {
        [":serviceId"]: testServiceId,
      }),
    });
  });

  it("POST checks permissions and renders redirects to a 403 if the user does not have permissions", async () => {
    vi.spyOn(
      permissionsService,
      "checkUserHasWriterPermissions"
    ).mockResolvedValue(false);

    // arrange
    const postController = createClientSummaryPost(mockClientRegistryApi);
    const testServiceId = "test-service-123";
    const req = new RequestBuilder()
      .withParams({ serviceId: testServiceId })
      .build();
    const res = mockResponse();

    // act
    await postController(req, res);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["403_ERROR"]);
  });

  it("POST redirects to a 500 page if there is an error creating the client using the client registry api", async () => {
    // arrange
    vi.spyOn(
      permissionsService,
      "checkUserHasWriterPermissions"
    ).mockResolvedValue(true);
    vi.mocked(
      mockClientRegistryApi.addClientToClientRegistry
    ).mockResolvedValue(
      Result.failure(new Error("Failed to add client to registry"))
    );

    const postController = createClientSummaryPost(mockClientRegistryApi);
    const testServiceId = "test-service-123";
    const req = new RequestBuilder()
      .withParams({ serviceId: testServiceId })
      .build();
    const res = mockResponse();

    // act
    await postController(req, res);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
  });

  it("POST calls the client registry API, creates a service client entry and redirects to success page", async () => {
    // arrange
    const testClientId = "client-123";

    vi.spyOn(
      permissionsService,
      "checkUserHasWriterPermissions"
    ).mockResolvedValue(true);

    vi.mocked(
      mockClientRegistryApi.addClientToClientRegistry
    ).mockResolvedValue(
      Result.success({
        ...generateClientRegistryInput(),
        clientId: testClientId,
        created: "",
        lastModified: "",
      })
    );
    vi.mocked(addClientToService).mockResolvedValue(void 0);

    const postController = createClientSummaryPost(mockClientRegistryApi);
    const testServiceId = "test-service-123";
    const req = new RequestBuilder()
      .withParams({ serviceId: testServiceId })
      .build();
    const res = mockResponse();

    // act
    await postController(req, res);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(
      populateUrlRoute(PATH_NAMES.CREATE_CLIENT_SUCCESS, {
        [":serviceId"]: testServiceId,
      })
    );
    expect(req.session.save).toHaveBeenCalledTimes(1);
    expect(req.session.newClientConfig).toStrictEqual({});
  });
});
