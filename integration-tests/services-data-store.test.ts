/* eslint-disable vitest/max-expects */
import { Service } from "../src/models/service.js";
import { integrationTest, setupServicesTable } from "./base.js";
import {
  createService,
  addClientToService,
  getServiceByServiceId,
  getClientsByServiceId,
} from "../src/datastores/services-data-store.js";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { ClientServiceSummary, ClientSummary } from "../src/models/client.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";

describe("Services data store tests", () => {
  setupServicesTable();

  describe("getServiceByServiceId", () => {
    integrationTest(
      "should get service from table by serviceId if service exists",
      async ({ addServiceToDynamo }) => {
        const serviceId = "test-service-id";
        const existingService: Service = {
          serviceId: serviceId,
          name: "Test service",
        };
        await addServiceToDynamo(existingService);

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

  describe("createService", () => {
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
      async ({ addServiceToDynamo }) => {
        const existingService: Service = {
          serviceId: "test-service",
          name: "My test service",
        };
        await addServiceToDynamo(existingService);

        await expect(createService(existingService)).rejects.toThrow(
          ConditionalCheckFailedException
        );
      }
    );
  });

  describe("addClientToService", () => {
    integrationTest(
      "should add client to service if service exists",
      async ({ addServiceToDynamo, getClientFromDynamo }) => {
        const serviceId = "test-service-id";
        const existingService: Service = {
          serviceId,
          name: "Test service",
        };
        await addServiceToDynamo(existingService);

        const client: ClientSummary = {
          clientId: "test-client-id",
          env: "integration",
          name: "Test Client",
        };

        const clientServiceSummary: ClientServiceSummary = {
          ...client,
          serviceId,
        };

        await addClientToService(clientServiceSummary);

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
        const client: ClientServiceSummary = {
          clientId: "test-client-id",
          env: "integration",
          name: "Test Client",
          serviceId,
        };

        await expect(addClientToService(client)).rejects.toThrow(
          TransactionCanceledException
        );
      }
    );

    integrationTest(
      "should fail to add client to service if client already exists",
      async ({ addServiceToDynamo }) => {
        const serviceId = "test-service-id";
        const existingService: Service = {
          serviceId: serviceId,
          name: "Test service",
        };
        await addServiceToDynamo(existingService);

        await expect(createService(existingService)).rejects.toThrow(
          ConditionalCheckFailedException
        );
      }
    );
  });

  describe("getClientsByServiceId", () => {
    integrationTest(
      "should fail to add user permission if permission already exists",
      async ({ addServiceToDynamo, addClientsToDynamo }) => {
        const serviceId = "test-service-id";
        const existingService: Service = {
          serviceId: serviceId,
          name: "Test service",
        };
        await addServiceToDynamo(existingService);

        const client1 = {
          clientId: "test-client-id-1",
          env: "integration",
          name: "Test Client 1",
        };

        const client2 = {
          clientId: "test-client-id-2",
          env: "integration",
          name: "Test Client 2",
        };

        const client3 = {
          clientId: "test-client-id-3",
          env: "production",
          name: "Test Client 3",
        };

        const clientServiceSummariess: ClientServiceSummary[] = [
          {
            ...client1,
            serviceId,
          } as ClientServiceSummary,
          {
            ...client2,
            serviceId,
          } as ClientServiceSummary,
          {
            ...client3,
            serviceId,
          } as ClientServiceSummary,
        ];
        await addClientsToDynamo(clientServiceSummariess);

        const clients = await getClientsByServiceId(serviceId);

        expect(clients).toStrictEqual([client1, client2, client3]);
      }
    );
  });
});
