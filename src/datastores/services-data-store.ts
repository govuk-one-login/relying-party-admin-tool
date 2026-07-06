import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Service } from "../models/service.js";

const dynamoClient = DynamoDBDocument.from(
  new DynamoDBClient({
    region: "eu-west-2",
    ...(process.env.DYNAMO_ENDPOINT && {
      endpoint: process.env.DYNAMO_ENDPOINT,
    }),
  })
);
export const tableName = `${process.env.ENVIRONMENT ?? "test"}-services`;

export const getServiceByServiceId = async (
  serviceId: string
): Promise<Service | undefined> => {
  const result = await dynamoClient.get({
    TableName: tableName,
    Key: { serviceId: serviceId, sk: "service" },
  });
  if (!result.Item) {
    return;
  }
  return {
    serviceId: result.Item.serviceId,
    name: result.Item.name,
  } as Service;
};
