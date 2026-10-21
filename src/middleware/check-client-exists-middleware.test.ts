import { Response } from "express";
import { getClientForService } from "../datastores/services-data-store.js";
import { RequestBuilder } from "../utils/test-utils/builders.js";
import { ClientEnvironment } from "../models/client-environment.js";
import { checkClientExistsForEnvMiddleware } from "./check-client-exists-middleware.js";

vi.mock(import("../datastores/services-data-store.js"), () => {
  return {
    getClientForService: vi.fn(),
  };
});

describe("check client exists middleware", () => {
  const clientExistsMiddleware = checkClientExistsForEnvMiddleware(
    ClientEnvironment.INTEGRATION
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls next() if the service client exists", async () => {
    // arrange
    const serviceId = "1234";
    const clientId = "abcd123";

    vi.mocked(getClientForService).mockResolvedValue({
      serviceId,
      name: "test-service",
      clientId,
      env: ClientEnvironment.INTEGRATION,
    });

    const req = new RequestBuilder().build();
    req.params = {
      serviceId,
      clientId,
    };
    const res = {} as Response;
    const next = vi.fn();
    //act
    await clientExistsMiddleware(req, res, next);

    //assert
    expect(next).toHaveBeenCalledWith();
  });

  it("returns a 403 and renders forbidden template if the service client does not exist", async () => {
    // arrange
    const serviceId = "1234";
    vi.mocked(getClientForService).mockResolvedValue(undefined);

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
    await clientExistsMiddleware(req, res, next);

    //assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith("common/errors/403.njk");
  });

  it("returns a 403 and renders forbidden template if the serviceId is not a string", async () => {
    // arrange
    const serviceId = "1234";
    const clientId = "abcd123";

    vi.mocked(getClientForService).mockResolvedValue({
      serviceId,
      name: "test-service",
      clientId,
      env: ClientEnvironment.INTEGRATION,
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
    await clientExistsMiddleware(req, res, next);

    //assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith("common/errors/403.njk");
  });

  it("returns a 403 and renders forbidden template if the clientID is not a string", async () => {
    // arrange
    const serviceId = "1234";
    const clientId = "abcd123";

    vi.mocked(getClientForService).mockResolvedValue({
      serviceId,
      name: "test-service",
      clientId,
      env: ClientEnvironment.INTEGRATION,
    });

    const req = new RequestBuilder().build();
    req.params = {
      serviceId,
      clientId: ["3", "4"],
    };

    const res = {
      status: vi.fn(),
      render: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    //act
    await clientExistsMiddleware(req, res, next);

    //assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith("common/errors/403.njk");
  });
});
