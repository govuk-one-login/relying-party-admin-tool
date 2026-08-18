import {
  getServicesUserCanEdit,
  getServicesUserCanView,
} from "./service-permissions-service.js";
import * as UserPermissionDataStore from "../datastores/user-permissions-data-store.js";
import * as ServiceDataStore from "../datastores/services-data-store.js";
import { Service } from "../models/service.js";
import { UserPermission } from "../models/permissions.js";

describe("Service permissions service tests", () => {
  let userId: string;
  let service1: Service;
  let service2: Service;
  let service3: Service;

  beforeEach(() => {
    userId = "testUserId1";
    service1 = { serviceId: "1", name: "service1" };
    service2 = { serviceId: "2", name: "service2" };
    service3 = { serviceId: "3", name: "service3" };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should get all allowed services that can be viewed for a user with userId", async () => {
    vi.spyOn(
      UserPermissionDataStore,
      "getServicesWithRelationForUser"
    ).mockResolvedValue([service1.serviceId, service2.serviceId]);
    vi.spyOn(ServiceDataStore, "getServiceByServiceId").mockImplementation(
      (serviceId: string) => {
        const serviceObject: Service = {
          serviceId: serviceId,
          name: `service${serviceId}`,
        };
        return Promise.resolve(serviceObject);
      }
    );
    const services = await getServicesUserCanView(userId);

    expect(services).toStrictEqual([service1, service2]);
  });

  it("should get all allowed services that can be edited for a user with userId", async () => {
    vi.spyOn(
      UserPermissionDataStore,
      "getServicesWithRelationForUser"
    ).mockImplementation((id: string, relation: string) => {
      if (relation == UserPermission.WRITER_INT) {
        return Promise.resolve([service1.serviceId, service2.serviceId]);
      } else if (relation == UserPermission.WRITER_PROD) {
        return Promise.resolve([service3.serviceId]);
      } else {
        return Promise.resolve([]);
      }
    });
    vi.spyOn(ServiceDataStore, "getServiceByServiceId").mockImplementation(
      (serviceId: string) => {
        const serviceObject: Service = {
          serviceId: serviceId,
          name: `service${serviceId}`,
        };
        return Promise.resolve(serviceObject);
      }
    );

    const services = await getServicesUserCanEdit(userId);

    expect(services).toStrictEqual([service1, service2, service3]);
  });
});
