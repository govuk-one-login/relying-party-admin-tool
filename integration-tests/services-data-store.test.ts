/* eslint-disable vitest/max-expects */
import { Service } from "../src/models/service.js";
import { integrationTest } from "./base.js";
import {
  addClientToService,
  getServiceByServiceId,
  getClientsByServiceId,
} from "../src/datastores/services-data-store.js";
import { ClientServiceSummary, ClientSummary } from "../src/models/client.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

describe("Services data store tests", () => {
  const existingServiceId = randomUUID();
  const existingService: Service = {
    serviceId: existingServiceId,
    name: "Test service",
  };

  integrationTest.beforeAll(async ({ addServiceToDynamo }) => {
    await addServiceToDynamo(existingService);
  });

  integrationTest.afterAll(async ({ deleteServiceFromDynamo }) => {
    await deleteServiceFromDynamo(existingService);
  });

  describe("getServiceByServiceId", () => {
    integrationTest(
      "should get service from table by serviceId if service exists",
      async () => {
        const service = await getServiceByServiceId(existingServiceId);

        expect(service).toStrictEqual(existingService);
      }
    );

    integrationTest(
      "should not get service if service with ID does not exist",
      async () => {
        const service = await getServiceByServiceId("not-a-service-id");

        expect(service).toBeUndefined();
      }
    );
  });

  describe("addClientToService", () => {
    const clientId1 = randomUUID();
    const client1: ClientSummary = {
      clientId: clientId1,
      name: "Test Client",
      env: "integration",
    };
    const clientServiceSummary1: ClientServiceSummary = {
      ...client1,
      serviceId: existingServiceId,
    };

    const clientId2 = randomUUID();
    const client2: ClientSummary = {
      clientId: clientId2,
      name: "Test Client 2",
      env: "integration",
    };
    const clientServiceSummary2: ClientServiceSummary = {
      ...client2,
      serviceId: existingServiceId,
    };

    integrationTest.afterAll(async ({ deleteClientsFromDynamo }) => {
      await deleteClientsFromDynamo([
        clientServiceSummary1,
        clientServiceSummary2,
      ]);
    });

    integrationTest(
      "should add client to service if service exists",
      async ({ getClientFromDynamo }) => {
        await addClientToService(clientServiceSummary1);

        const actualClient = await getClientFromDynamo(
          existingServiceId,
          client1.env,
          client1.clientId
        );

        expect(actualClient).toStrictEqual(client1);
      }
    );

    integrationTest(
      "should fail to add client to service if service does not exist",
      async () => {
        const fakeServiceId = "fake-test-service-id";
        const client: ClientServiceSummary = {
          clientId: "fake-test-client-id",
          env: "integration",
          name: "Test Client",
          serviceId: fakeServiceId,
        };

        await expect(addClientToService(client)).rejects.toThrow(
          TransactionCanceledException
        );
      }
    );

    integrationTest(
      "should fail to add client to service if client already exists",
      async ({ addClientsToDynamo }) => {
        await addClientsToDynamo([clientServiceSummary2]);

        await expect(addClientToService(clientServiceSummary2)).rejects.toThrow(
          TransactionCanceledException
        );
      }
    );
  });

  describe("getClientsByServiceId", () => {
    const testServiceIdWithClients = randomUUID();
    const testServiceWithClients: Service = {
      serviceId: testServiceIdWithClients,
      name: "Test service",
    };

    const clientId1 = randomUUID();
    const client1: ClientSummary = {
      clientId: clientId1,
      name: "Test Client",
      env: "integration",
    };
    const clientServiceSummary1: ClientServiceSummary = {
      ...client1,
      serviceId: testServiceIdWithClients,
    };

    const clientId2 = randomUUID();
    const client2: ClientSummary = {
      clientId: clientId2,
      name: "Test Client 2",
      env: "integration",
    };
    const clientServiceSummary2: ClientServiceSummary = {
      ...client2,
      serviceId: testServiceIdWithClients,
    };

    integrationTest.beforeAll(
      async ({ addServiceToDynamo, addClientsToDynamo }) => {
        await addServiceToDynamo(testServiceWithClients);

        const clientServiceSummaries: ClientServiceSummary[] = [
          clientServiceSummary1,
          clientServiceSummary2,
        ];
        await addClientsToDynamo(clientServiceSummaries);
      }
    );

    integrationTest.afterAll(
      async ({ deleteServiceFromDynamo, deleteClientsFromDynamo }) => {
        await deleteServiceFromDynamo(testServiceWithClients);

        const clientServiceSummaries: ClientServiceSummary[] = [
          clientServiceSummary1,
          clientServiceSummary2,
        ];
        await deleteClientsFromDynamo(clientServiceSummaries);
      }
    );

    integrationTest(
      "should get clients by service id if clients exist",
      async () => {
        const clients = await getClientsByServiceId(testServiceIdWithClients);

        expect(clients).toContainEqual(expect.objectContaining(client1));
        expect(clients).toContainEqual(expect.objectContaining(client2));
      }
    );

    integrationTest(
      "should not get clients if service with ID does not exist",
      async () => {
        const clients = await getClientsByServiceId("not-a-service-id");

        expect(clients).toStrictEqual([]);
      }
    );
  });
});
