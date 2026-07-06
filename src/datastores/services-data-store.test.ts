import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocument, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getServiceByServiceId } from "./services-data-store.js";

const TABLE_PREFIX = "test";
const TEST_SERVICE = {
  serviceId: "test-service-id",
  name: "Test User",
};

describe("Services store tests", () => {
  const mockDynamo = mockClient(DynamoDBDocument);

  beforeEach(() => {
    mockDynamo.reset();
  });

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

  it("should get no service if servvice does not exist with serviceId", async () => {
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
