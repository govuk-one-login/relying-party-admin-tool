import { PATH_NAMES } from "../../app.constants.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../utils/test-utils/builders.js";
import { getServicesUserCanView } from "./../../services/service-permissions-service.js";
import { servicesGet } from "./services-controller.js";

vi.mock(import("./../../services/service-permissions-service.js"), () => ({
  getServicesUserCanView: vi.fn(),
}));

describe("services controller tests", () => {
  it("renders the page with the services a user can view", async () => {
    // arrange
    const testService = { name: "test", serviceId: "service123" };
    vi.mocked(getServicesUserCanView).mockResolvedValue([testService]);
    const req = new RequestBuilder().build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await servicesGet()(req, res, next);

    // assert
    expect(res.render).toHaveBeenCalledWith("services/index.njk", {
      services: [testService],
    });
  });

  it("redirects to an error page if the request fails", async () => {
    vi.mocked(getServicesUserCanView).mockRejectedValue(
      new Error("Failed to get services")
    );
    const req = new RequestBuilder().build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await servicesGet()(req, res, next);

    // assert
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
  });
});
