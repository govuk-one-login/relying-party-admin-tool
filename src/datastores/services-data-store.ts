import { Service } from "../models/service.js";
import { ClientServiceSummary, ClientSummary } from "../models/client.js";
import { dynamoDocClient } from "../utils/dynamo.js";
import { ClientEnvironment } from "../models/client-environment.js";

export const servicesTableName = `${process.env.ENVIRONMENT ?? "test"}-services`;

export const getServiceByServiceId = async (
  serviceId: string
): Promise<Service | undefined> => {
  const result = await dynamoDocClient.get({
    TableName: servicesTableName,
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

export const getAllClientsByServiceId = async (
  serviceId: string
): Promise<ClientSummary[]> => {
  const result = await dynamoDocClient.query({
    TableName: servicesTableName,
    KeyConditionExpression: "serviceId = :pk AND begins_with(sk, :prefix)",
    ExpressionAttributeValues: {
      ":pk": serviceId,
      ":prefix": "client#",
    },
  });
  if (!result.Items) {
    return [];
  }
  return result.Items.map((serviceClientRelation) => {
    const sk = serviceClientRelation["sk"].split("#");
    return {
      clientId: sk[2],
      name: serviceClientRelation["name"],
      env: serviceClientRelation["env"],
    };
  });
};

export const getClientForService = async (
  serviceId: string,
  clientId: string,
  env: ClientEnvironment
): Promise<ClientServiceSummary | undefined> => {
  const result = await dynamoDocClient.get({
    TableName: servicesTableName,
    Key: {
      serviceId,
      sk: `client#${env}#${clientId}`,
    },
  });

  if (!result.Item) {
    return;
  }

  delete result.Item.sk;

  return result.Item as ClientServiceSummary;
};

export const addClientToService = async (
  clientServiceSummary: ClientServiceSummary
): Promise<void> => {
  await dynamoDocClient.transactWrite({
    TransactItems: [
      {
        ConditionCheck: {
          TableName: servicesTableName,
          Key: { serviceId: clientServiceSummary.serviceId, sk: "service" },
          ConditionExpression: "attribute_exists(serviceId)",
        },
      },
      {
        Put: {
          TableName: servicesTableName,
          Item: {
            serviceId: clientServiceSummary.serviceId,
            sk: `client#${clientServiceSummary.env}#${clientServiceSummary.clientId}`,
            env: clientServiceSummary.env,
            name: clientServiceSummary.name,
            clientId: clientServiceSummary.clientId,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
    ],
  });
};
