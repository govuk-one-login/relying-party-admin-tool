import { Service } from "../src/models/service.js";
import { integrationTest, setupServicesTable } from "./base.js";
import { getServiceByServiceId } from "../src/datastores/services-data-store.js";

describe("Services data store tests", () => {
  setupServicesTable();
  integrationTest(
    "should get service from table by serviceId if service exists",
    async ({ addServicesToDynamo }) => {
      const serviceId = "test-service-id";
      const existingService: Service = {
        serviceId: serviceId,
        name: "Test service",
      };
      await addServicesToDynamo(existingService);

      const service = await getServiceByServiceId(serviceId);

      expect(service).toStrictEqual(existingService);
    }
  );

  integrationTest(
    "should not get service if service with ID does not exist",
    async () => {
      const user = await getServiceByServiceId("not-a-service-id");

      expect(user).toBeUndefined();
    }
  );
});
