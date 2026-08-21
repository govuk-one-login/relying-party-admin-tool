import { Service } from "../src/models/service.js";
import { integrationTest, setupServicesTable } from "./base.js";
import {
  createService,
  addClientToService,
  getServiceByServiceId,
} from "../src/datastores/services-data-store.js";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { ClientSummary } from "../src/models/client.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";

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

  integrationTest(
    "should create service if services does not already exist",
    async () => {
      const serviceToStore: Service = {
        serviceId: "test-service",
        name: "My test service",
      };
      await createService(serviceToStore);

      const actualService = await getServiceByServiceId("test-service");

      expect(actualService).toStrictEqual(serviceToStore);
    }
  );
  integrationTest(
    "should fail to create service if service already exists",
    async ({ addServicesToDynamo }) => {
      const existingService: Service = {
        serviceId: "test-service",
        name: "My test service",
      };
      await addServicesToDynamo(existingService);

      await expect(createService(existingService)).rejects.toThrow(
        ConditionalCheckFailedException
      );
    }
  );

  integrationTest(
    "should add client to service if service exists",
    async ({ addServicesToDynamo, getClientFromDynamo }) => {
      const serviceId = "test-service-id";
      const existingService: Service = {
        serviceId: serviceId,
        name: "Test service",
      };
      await addServicesToDynamo(existingService);

      const client: ClientSummary = {
        clientId: "test-client-id",
        env: "integration",
        name: "Test Client",
      };
      await addClientToService(client, serviceId);

      const actualClient = await getClientFromDynamo(
        serviceId,
        client.env,
        client.clientId
      );

      expect(actualClient).toStrictEqual(client);
    }
  );

  integrationTest(
    "should fail to add client to service if service does not exist",
    async () => {
      const serviceId = "test-service-id";
      const client: ClientSummary = {
        clientId: "test-client-id",
        env: "integration",
        name: "Test Client",
      };

      await expect(addClientToService(client, serviceId)).rejects.toThrow(
        TransactionCanceledException
      );
    }
  );

  integrationTest(
    "should fail to add client to service if client already exists",
    async ({ addServicesToDynamo }) => {
      const serviceId = "test-service-id";
      const existingService: Service = {
        serviceId: serviceId,
        name: "Test service",
      };
      await addServicesToDynamo(existingService);

      await expect(createService(existingService)).rejects.toThrow(ConditionalCheckFailedException);
    }
  );
});
