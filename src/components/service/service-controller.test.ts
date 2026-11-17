import { PATH_NAMES } from "../../app.constants.js";
import {
  getAllClientsByServiceId,
  getServiceByServiceId,
} from "../../datastores/services-data-store.js";
import { ClientSummary } from "../../models/client.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../utils/test-utils/builders.js";
import { serviceGet } from "./service-controller.js";

vi.mock(import("../../datastores/services-data-store.js"), () => {
  return {
    getServiceByServiceId: vi.fn(),
    getAllClientsByServiceId: vi.fn(),
  };
});

describe("service controller tests", () => {
  const serviceId = "123";
  const testPath = `/service/${serviceId}`;
  const testService = {
    serviceId,
    name: "test-service",
  };
  const prodClient: ClientSummary = {
    clientId: "test-prod-client-123",
    name: "prodClient",
    env: "production",
  };

  const intClient: ClientSummary = {
    clientId: "test-int-client-123",
    name: "intClient",
    env: "integration",
  };

  it("renders the integration and production clients", async () => {
    // arrange
    vi.mocked(getServiceByServiceId).mockResolvedValue(testService);
    vi.mocked(getAllClientsByServiceId).mockResolvedValue([
      intClient,
      prodClient,
    ]);
    const req = new RequestBuilder()
      .withPath(testPath)
      .withParams({ serviceId })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await serviceGet()(req, res, next);

    expect(res.render).toHaveBeenCalledWith("service/index.njk", {
      serviceId,
      hasIntegrationWriterPermissions: true,
      sideNavItems: [
        {
          active: true,
          text: "Clients",
          href: testPath,
        },
        {
          active: false,
          text: "Team members",
          href: testPath + "/team-members",
        },
      ],
      service: testService,
      productionClient: prodClient,
      integrationClients: [intClient],
    });
  });

  it("redirects to an error page when failing to get a service", async () => {
    // arrange
    vi.mocked(getServiceByServiceId).mockRejectedValue(
      new Error("Failed to get service")
    );
    vi.mocked(getAllClientsByServiceId).mockResolvedValue([
      intClient,
      prodClient,
    ]);
    const req = new RequestBuilder()
      .withPath(testPath)
      .withParams({ serviceId })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await serviceGet()(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
  });

  it("redirects to an error page when failing to get clients for the service", async () => {
    // arrange
    vi.mocked(getServiceByServiceId).mockResolvedValue(testService);
    vi.mocked(getAllClientsByServiceId).mockRejectedValue(
      new Error("Failed to get clients for service")
    );
    const req = new RequestBuilder()
      .withPath(testPath)
      .withParams({ serviceId })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await serviceGet()(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
  });
});
