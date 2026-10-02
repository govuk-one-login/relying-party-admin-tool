/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-pattern */
import request, { SuperAgentTest } from "supertest";
import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { test } from "vitest";
import { User } from "../src/models/user.js";
import { logger } from "../src/utils/logger.js";
import { Service } from "../src/models/service.js";
import { Relation } from "../src/models/relation.js";
import { ClientServiceSummary, ClientSummary } from "../src/models/client.js";
import TestAgent from "supertest/lib/agent.js";
import { createApp } from "../src/app.js";

export enum Table {
  EMPTY,

  USER_PERMISSIONS,

  SERVICES,

  SESSION,
}

export interface TestFixtures {
  dynamoClient: DynamoDBClient;
  dynamoDocClient: DynamoDBDocument;
  tables: Table[];
  addUserToDynamo: (user: User) => Promise<void>;
  getUserFromDynamo: (
    userId: string
  ) => Promise<{ id: string; name: string; email: string } | undefined>;
  deleteUserFromDynamo: (user: User) => Promise<void>;
  addUserRelationToDynamo: (relation: Relation) => Promise<void>;
  userPermissionExistsInDynamo: (relation: Relation) => Promise<boolean>;
  deleteUserRelationFromDynamo: (relation: Relation) => Promise<void>;
  addServiceToDynamo: (service: Service) => Promise<void>;
  getServiceFromDynamo: (serviceId: string) => Promise<any>;
  deleteServiceFromDynamo: (service: Service) => Promise<void>;
  addClientsToDynamo: (clients: ClientServiceSummary[]) => Promise<void>;
  getClientFromDynamo: (
    serviceId: string,
    env: "production" | "integration",
    clientId: string
  ) => Promise<ClientSummary>;
  deleteClientsFromDynamo: (clients: ClientServiceSummary[]) => Promise<void>;
}

export const integrationTest = test.extend<TestFixtures>({
  dynamoClient: [
    async ({}, use) => {
      const client = new DynamoDBClient({
        region: "eu-west-2",
        ...(process.env.DYNAMO_ENDPOINT && {
          endpoint: process.env.DYNAMO_ENDPOINT,
        }),
      });
      await use(client);
    },
    { scope: "file" },
  ],

  dynamoDocClient: [
    async ({ dynamoClient }, use) => {
      await use(DynamoDBDocument.from(dynamoClient));
    },
    { scope: "file" },
  ],

  tables: [
    async ({}, use) => {
      await use([Table.USER_PERMISSIONS, Table.SERVICES, Table.SESSION]);
    },
    { scope: "file" },
  ],

  addUserToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (user: User) => {
        await dynamoDocClient.put({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Item: {
            subject: `user:${user.id}`,
            email: user.email,
            name: user.name,
            sk: "user",
          },
        });
      });
    },
    { scope: "file" },
  ],

  getUserFromDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (userId: string) => {
      const item = (
        await dynamoDocClient.get({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Key: { subject: `user:${userId}`, sk: "user" },
        })
      ).Item;
      if (!item) return;
      return {
        id: item.subject.substring(5),
        name: item.name,
        email: item.email,
      };
    });
  },

  deleteUserFromDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (user: User) => {
        await dynamoDocClient.delete({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Key: {
            subject: `user:${user.id}`,
            sk: "user",
          },
        });
      });
    },
    { scope: "file" },
  ],

  addUserRelationToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (relation: Relation) => {
        await dynamoDocClient.put({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Item: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
            object: `${relation.object}`,
            relation: `${relation.relation}`,
          },
        });
      });
    },
    { scope: "file" },
  ],

  userPermissionExistsInDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (relation: Relation) => {
      const item = (
        await dynamoDocClient.get({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Key: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
          },
        })
      ).Item;
      return Boolean(item);
    });
  },

  deleteUserRelationFromDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (relation: Relation) => {
        await dynamoDocClient.delete({
          TableName: `${process.env.ENVIRONMENT}-user-permissions`,
          Key: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
          },
        });
      });
    },
    { scope: "file" },
  ],

  addServiceToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (service: Service) => {
        await dynamoDocClient.put({
          TableName: `${process.env.ENVIRONMENT}-services`,
          Item: {
            serviceId: service.serviceId,
            name: service.name,
            sk: "service",
          },
        });
      });
    },
    { scope: "file" },
  ],

  getServiceFromDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (serviceId: string) => {
      return (
        await dynamoDocClient.get({
          TableName: `${process.env.ENVIRONMENT}-services`,
          Key: { serviceId: serviceId, sk: "service" },
        })
      ).Item;
    });
  },

  deleteServiceFromDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (service: Service) => {
        await dynamoDocClient.delete({
          TableName: `${process.env.ENVIRONMENT}-services`,
          Key: {
            serviceId: service.serviceId,
            sk: "service",
          },
        });
      });
    },
    { scope: "file" },
  ],

  addClientsToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (clients: ClientServiceSummary[]) => {
        for (const client of clients) {
          await dynamoDocClient.put({
            TableName: `${process.env.ENVIRONMENT}-services`,
            Item: {
              serviceId: client.serviceId,
              name: client.name,
              sk: `client#${client.env}#${client.clientId}`,
              env: client.env,
              clientId: client.clientId,
            },
          });
        }
      });
    },
    { scope: "file" },
  ],

  getClientFromDynamo: async ({ dynamoDocClient }, use) => {
    await use(
      async (
        serviceId: string,
        env: "production" | "integration",
        clientId: string
      ): Promise<ClientSummary> => {
        const item = (
          await dynamoDocClient.get({
            TableName: `${process.env.ENVIRONMENT}-services`,
            Key: {
              serviceId: serviceId,
              sk: `client#${env}#${clientId}`,
            },
          })
        ).Item;

        return {
          clientId: item?.clientId,
          name: item?.name,
          env: item?.env,
        };
      }
    );
  },

  deleteClientsFromDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (clients: ClientServiceSummary[]) => {
        for (const client of clients) {
          await dynamoDocClient.delete({
            TableName: `${process.env.ENVIRONMENT}-services`,
            Key: {
              serviceId: client.serviceId,
              sk: `client#${client.env}#${client.clientId}`,
            },
          });
        }
      });
    },
    { scope: "file" },
  ],
});

integrationTest.beforeAll(async ({ dynamoClient, tables }) => {
  if (tables.includes(Table.USER_PERMISSIONS)) {
    await createUserPermissionsTableIfNotExists(dynamoClient);
    logger.info("Creating user permissions table");
  }
  if (tables.includes(Table.SERVICES)) {
    await createServicesTableIfNotExists(dynamoClient);
    logger.info("Creating services table");
  }
  if (tables.includes(Table.SESSION)) {
    await createSessionTableIfNotExists(dynamoClient);
    logger.info("Creating session table");
  }
});

const createUserPermissionsTableIfNotExists = async (
  dynamoClient: DynamoDBClient
) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.ENVIRONMENT}-user-permissions`,
    AttributeDefinitions: [
      {
        AttributeName: "subject",
        AttributeType: "S",
      },
      {
        AttributeName: "sk",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "subject",
        KeyType: "HASH",
      },
      {
        AttributeName: "sk",
        KeyType: "RANGE",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });
  try {
    await dynamoClient.send(command);
  } catch (err: any) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};

const createServicesTableIfNotExists = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.ENVIRONMENT}-services`,
    AttributeDefinitions: [
      {
        AttributeName: "serviceId",
        AttributeType: "S",
      },
      {
        AttributeName: "sk",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "serviceId",
        KeyType: "HASH",
      },
      {
        AttributeName: "sk",
        KeyType: "RANGE",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });
  try {
    await dynamoClient.send(command);
  } catch (err: any) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};

const createSessionTableIfNotExists = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.ENVIRONMENT}-frontend-sessions`,
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });
  try {
    await dynamoClient.send(command);
  } catch (err: any) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};
