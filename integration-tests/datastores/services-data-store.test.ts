/* eslint-disable vitest/max-expects */
import { Service } from "../../src/models/service.js";
import { integrationTest } from "../base.js";
import {
  createService,
  addClientToService,
  getServiceByServiceId,
  getClientsByServiceId,
} from "../../src/datastores/services-data-store.js";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  ClientServiceSummary,
  ClientSummary,
} from "../../src/models/client.js";
import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";

describe("Services data store tests", () => {
  const existingServiceId = "existing-service-id";
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

  describe("createService", () => {
    const testServiceId = "test-service-id";
    const testService: Service = {
      serviceId: testServiceId,
      name: "Test service",
    };

    integrationTest.afterAll(async ({ deleteServiceFromDynamo }) => {
      await deleteServiceFromDynamo(testService);
    });

    integrationTest(
      "should create service if services does not already exist",
      async ({ getServiceFromDynamo }) => {
        await createService(testService);

        const actualService = await getServiceFromDynamo(testServiceId);

        expect(actualService).toEqual(expect.objectContaining(testService));
      }
    );

    integrationTest(
      "should fail to create service if service already exists",
      async () => {
        await expect(createService(existingService)).rejects.toThrow(
          ConditionalCheckFailedException
        );
      }
    );
  });

  describe("addClientToService", () => {
    const clientId1 = "test-client-id";
    const client1: ClientSummary = {
      clientId: clientId1,
      name: "Test Client",
      env: "integration",
    };
    const clientServiceSummary1: ClientServiceSummary = {
      ...client1,
      serviceId: existingServiceId,
    };

    const clientId2 = "test-client-id-2";
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
    const testServiceId = "existing-service-id-with-clients";
    const testService: Service = {
      serviceId: testServiceId,
      name: "Test service",
    };

    const clientId1 = "existing-client-id";
    const client1: ClientSummary = {
      clientId: clientId1,
      name: "Test Client",
      env: "integration",
    };
    const clientServiceSummary1: ClientServiceSummary = {
      ...client1,
      serviceId: testServiceId,
    };

    const clientId2 = "existing-client-id-2";
    const client2: ClientSummary = {
      clientId: clientId2,
      name: "Test Client 2",
      env: "integration",
    };
    const clientServiceSummary2: ClientServiceSummary = {
      ...client2,
      serviceId: testServiceId,
    };

    integrationTest.beforeAll(
      async ({ addServiceToDynamo, addClientsToDynamo }) => {
        await addServiceToDynamo(testService);

        const clientServiceSummaries: ClientServiceSummary[] = [
          clientServiceSummary1,
          clientServiceSummary2,
        ];
        await addClientsToDynamo(clientServiceSummaries);
      }
    );

    integrationTest.afterAll(
      async ({ deleteServiceFromDynamo, deleteClientsFromDynamo }) => {
        await deleteServiceFromDynamo(testService);

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
        const clients = await getClientsByServiceId(testServiceId);

        expect(clients[0]).toEqual(expect.objectContaining(client1));
        expect(clients[1]).toEqual(expect.objectContaining(client2));
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
