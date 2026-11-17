import { PATH_NAMES } from "../../../app.constants.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../../utils/test-utils/builders.js";
import { createClientSuccessGet } from "./success-controller.js";

describe("success controller tests", () => {
  it("GET renders the success template with the current client config in the session", async () => {
    // arrange
    const getController = createClientSuccessGet();
    const testServiceId = "test-service-123";
    const testClientId = "test-client-123";
    const req = new RequestBuilder()
      .withSessionNewClientConfig({ clientId: testClientId })
      .withParams({ serviceId: testServiceId })
      .build();
    const res = mockResponse();

    // act
    await getController(req, res);

    // assert
    expect(res.render).toHaveBeenCalledWith("create-client/success/index.njk", {
      clientId: testClientId,
      serviceUrl: populateUrlRoute(PATH_NAMES.SERVICE, {
        [":serviceId"]: testServiceId,
      }),
    });
  });
});
