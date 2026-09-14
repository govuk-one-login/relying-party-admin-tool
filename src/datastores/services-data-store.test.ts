import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBDocument,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  getClientsByServiceId,
  getServiceByServiceId,
} from "./services-data-store.js";

const TABLE_PREFIX = "test";
const TEST_SERVICE = {
  serviceId: "test-service-id",
  name: "Test Service",
};
const TEST_INT_CLIENT = {
  env: "integration",
  clientId: "test-client-id-1",
  name: "Test Int Client 1",
};

describe("Services store tests", () => {
  const mockDynamo = mockClient(DynamoDBDocument);

  beforeEach(() => {
    mockDynamo.reset();
  });

  describe("getServiceByServiceId", () => {
    it("should get service by serviceId when service exists in dynamo", async () => {
      const serviceId = "test-service-id";

      mockDynamo
        .on(GetCommand, {
          TableName: `${TABLE_PREFIX}-services`,
          Key: {
            serviceId: serviceId,
            sk: "service",
          },
        })
        .resolves({
          Item: {
            serviceId: serviceId,
            sk: "service",
            name: TEST_SERVICE.name,
          },
        });

      const result = await getServiceByServiceId(serviceId);

      expect(result).toStrictEqual(TEST_SERVICE);
    });

    it("should get no service if service does not exist with serviceId", async () => {
      const serviceId = "not-a-service-id";

      mockDynamo
        .on(GetCommand, {
          TableName: `${TABLE_PREFIX}-services`,
          Key: {
            serviceId: serviceId,
            sk: "service",
          },
        })
        .resolves({});

      const result = await getServiceByServiceId(serviceId);

      expect(result).toBeUndefined();
    });
  });

  describe("getClientsByServiceId", () => {
    it("should get clients by serviceId when client exists in dynamo", async () => {
      const serviceId = "test-service-id";

      mockDynamo
        .on(QueryCommand, {
          TableName: `${TABLE_PREFIX}-services`,
          KeyConditionExpression:
            "serviceId = :pk AND begins_with(sk, :prefix)",
          ExpressionAttributeValues: {
            ":pk": serviceId,
            ":prefix": "client#",
          },
        })
        .resolves({
          Items: [
            {
              serviceId: serviceId,
              sk: `client#${TEST_INT_CLIENT.env}#${TEST_INT_CLIENT.clientId}`,
              env: TEST_INT_CLIENT.env,
              clientId: TEST_INT_CLIENT.clientId,
              name: TEST_INT_CLIENT.name,
            },
          ],
        });

      const result = await getClientsByServiceId(serviceId);

      expect(result).toStrictEqual([TEST_INT_CLIENT]);
    });

    it("should get no client if client does not exist with serviceId", async () => {
      const serviceId = "not-a-service-id";

      mockDynamo
        .on(QueryCommand, {
          TableName: `${TABLE_PREFIX}-services`,
          KeyConditionExpression:
            "serviceId = :pk AND begins_with(sk, :prefix)",
          ExpressionAttributeValues: {
            ":pk": serviceId,
            ":prefix": "client#",
          },
        })
        .resolves({ Items: [] });

      const result = await getClientsByServiceId(serviceId);

      expect(result).toHaveLength(0);
    });
  });
});
