import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Service } from "../models/service.js";
import { ClientSummary } from "../models/client.js";

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

export const createService = async (service: Service): Promise<void> => {
  await dynamoClient.put({
    TableName: tableName,
    Item: {
      serviceId: service.serviceId,
      sk: "service",
      name: service.name,
    },
    ConditionExpression: "attribute_not_exists(serviceId)",
  });
};

export const addClientToService = async (
  client: ClientSummary,
  serviceId: string
): Promise<void> => {
  await dynamoClient.transactWrite({
    TransactItems: [
      {
        ConditionCheck: {
          TableName: tableName,
          Key: { serviceId: serviceId, sk: "service" },
          ConditionExpression: "attribute_exists(serviceId)",
        },
      },
      {
        Put: {
          TableName: tableName,
          Item: {
            serviceId: serviceId,
            sk: `client#${client.env}#${client.clientId}`,
            env: client.env,
            name: client.name,
            clientId: client.clientId,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
    ],
  });
};
