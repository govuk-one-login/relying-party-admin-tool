import { randomBytes } from "crypto";
import { createNewServiceWithManagerUserPermissions } from "../../datastores/user-permissions-services-data-store.js";
import {
  mockResponse,
  RequestBuilder,
} from "../../utils/test-utils/builders.js";
import { createServicePost } from "./create-service-controller.js";
import { populateUrlRoute } from "../../utils/populate-url-route.js";
import { PATH_NAMES } from "../../app.constants.js";

vi.mock(
  import("./../../datastores/user-permissions-services-data-store.js"),
  () => ({
    createNewServiceWithManagerUserPermissions: vi.fn(),
  })
);

vi.mock(import("crypto"), async (importOriginal) => ({
  ...(await importOriginal()),
  randomBytes: vi.fn(),
}));

describe("create service contoller tests", () => {
  const testServiceId = "test-service-id-1234";
  const testServiceName = "test-service";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates a service and then redirects with the service ID", async () => {
    // arrange
    vi.mocked(createNewServiceWithManagerUserPermissions).mockResolvedValue(
      void 0
    );
    vi.mocked<(_: number) => Buffer>(randomBytes).mockReturnValue(
      Buffer.from(testServiceId, "base64url")
    );

    const req = new RequestBuilder()
      .withBody({ name: testServiceName })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await createServicePost()(req, res, next);

    //assert
    expect(createNewServiceWithManagerUserPermissions).toHaveBeenCalledWith(
      {
        serviceId: testServiceId,
        name: testServiceName,
      },
      "userId"
    );
    expect(res.redirect).toHaveBeenCalledWith(
      populateUrlRoute(PATH_NAMES.SERVICE, { [":serviceId"]: testServiceId })
    );
  });

  it("redirects to a 500 error page if creating the service fails", async () => {
    // arrange
    vi.mocked(createNewServiceWithManagerUserPermissions).mockRejectedValue(
      new Error("Failed to create Service")
    );
    vi.mocked<(_: number) => Buffer>(randomBytes).mockReturnValue(
      Buffer.from(testServiceId, "base64url")
    );

    const req = new RequestBuilder()
      .withBody({ name: testServiceName })
      .build();
    const res = mockResponse();
    const next = vi.fn();

    // act
    await createServicePost()(req, res, next);

    //assert
    expect(createNewServiceWithManagerUserPermissions).toHaveBeenCalledWith(
      {
        serviceId: testServiceId,
        name: testServiceName,
      },
      "userId"
    );
    expect(res.redirect).toHaveBeenCalledWith(PATH_NAMES["500_ERROR"]);
  });
});
