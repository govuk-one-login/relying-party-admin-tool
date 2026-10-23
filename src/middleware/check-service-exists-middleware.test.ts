import { Response } from "express";
import { getServiceByServiceId } from "../datastores/services-data-store.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";
import { serviceExistsMiddleware } from "./check-service-exists-middleware.js";

vi.mock(import("../datastores/services-data-store.js"), () => {
  return {
    getServiceByServiceId: vi.fn(),
  };
});

describe("check service exists middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() if the service exists", async () => {
    // arrange
    const serviceId = "1234";
    vi.mocked(getServiceByServiceId).mockResolvedValue({
      serviceId,
      name: "test-service",
    });

    const req = new RequestBuilder().build();
    req.params = {
      serviceId,
    };
    const res = {} as Response;
    const next = vi.fn();
    //act
    await serviceExistsMiddleware(req, res, next);

    //assert
    expect(next).toHaveBeenCalledWith();
  });

  it("returns a 404 and renders a not found template if the service does not exist", async () => {
    // arrange
    const serviceId = "1234";
    vi.mocked(getServiceByServiceId).mockResolvedValue(undefined);

    const req = new RequestBuilder().build();
    req.params = {
      serviceId,
    };

    const res = {
      status: vi.fn(),
      render: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    //act
    await serviceExistsMiddleware(req, res, next);

    //assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith("common/errors/403.njk");
  });

  it("returns a 404 and renders a not found template if the serviceId is not a string", async () => {
    // arrange
    const serviceId = "1234";
    vi.mocked(getServiceByServiceId).mockResolvedValue({
      serviceId,
      name: "test-service",
    });

    const req = new RequestBuilder().build();
    req.params = {
      serviceId: ["1", "2"],
    };

    const res = {
      status: vi.fn(),
      render: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    //act
    await serviceExistsMiddleware(req, res, next);

    //assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith("common/errors/403.njk");
  });
});
