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
  addUserRelationToDynamo: (relation: Relation) => Promise<void>;
  getUserFromDynamo: (
    userId: string
  ) => Promise<{ id: string; name: string; email: string } | undefined>;
  userPermissionExistsInDynamo: (relation: Relation) => Promise<boolean>;
  addServiceToDynamo: (service: Service) => Promise<void>;
  getServiceFromDynamo: (serviceId: string) => Promise<any>;
  addClientsToDynamo: (clients: ClientServiceSummary[]) => Promise<void>;
  getClientFromDynamo: (
    serviceId: string,
    env: "production" | "integration",
    clientId: string
  ) => Promise<ClientSummary>;
}

export const setupUserPermissionsTable = () => {
  integrationTest.override("tables", [Table.USER_PERMISSIONS]);
};

export const setupServicesTable = () => {
  integrationTest.override("tables", [Table.SERVICES]);
};

export const setupAllTables = () => {
  integrationTest.override("tables", [
    Table.USER_PERMISSIONS,
    Table.SERVICES,
    Table.SESSION,
  ]);
};

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
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
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

  addUserRelationToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (relation: Relation) => {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
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

  getUserFromDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (userId: string) => {
      const item = (
        await dynamoDocClient.get({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
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

  userPermissionExistsInDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (relation: Relation) => {
      const item = (
        await dynamoDocClient.get({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Key: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
          },
        })
      ).Item;
      return Boolean(item);
    });
  },

  addServiceToDynamo: [
    async ({ dynamoDocClient }, use) => {
      await use(async (service: Service) => {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-services`,
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
          TableName: `${process.env.VITEST_WORKER_ID}-services`,
          Key: { serviceId: serviceId },
        })
      ).Item;
    });
  },

  addClientsToDynamo: async ({ dynamoDocClient }, use) => {
    await use(async (clients: ClientServiceSummary[]) => {
      for (const client of clients) {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-services`,
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

  getClientFromDynamo: async ({ dynamoDocClient }, use) => {
    await use(
      async (
        serviceId: string,
        env: "production" | "integration",
        clientId: string
      ): Promise<ClientSummary> => {
        const item = (
          await dynamoDocClient.get({
            TableName: `${process.env.VITEST_WORKER_ID}-services`,
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
});

integrationTest.beforeAll(async ({ dynamoClient, tables }) => {
  if (tables.includes(Table.USER_PERMISSIONS)) {
    await createUserPermissionsTable(dynamoClient);
    logger.info("Creating user permissions table");
  }
  if (tables.includes(Table.SERVICES)) {
    await createServicesTable(dynamoClient);
    logger.info("Creating services table");
  }
  if (tables.includes(Table.SESSION)) {
    await createSessionTable(dynamoClient);
    logger.info("Creating session table");
  }
});

integrationTest.afterAll(async ({ dynamoClient, tables }) => {
  try {
    if (tables.includes(Table.USER_PERMISSIONS)) {
      await deleteUserPermissionsTable(dynamoClient);
      logger.info("Deleting user permissions table");
    }
    if (tables.includes(Table.SERVICES)) {
      await deleteServicesTable(dynamoClient);
      logger.info("Deleting services table");
    }
    if (tables.includes(Table.SESSION)) {
      await deleteSessionTable(dynamoClient);
      logger.info("Deleting session table");
    }
  } catch {
    logger.info("Table does not exist");
  }
});

const createUserPermissionsTable = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
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
  await dynamoClient.send(command);
};

const deleteUserPermissionsTable = async (dynamoClient: DynamoDBClient) => {
  const command = new DeleteTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
  });

  await dynamoClient.send(command);
};

const createServicesTable = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-services`,
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
  await dynamoClient.send(command);
};

const deleteServicesTable = async (dynamoClient: DynamoDBClient) => {
  const command = new DeleteTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-services`,
  });

  await dynamoClient.send(command);
};

const createSessionTable = async (dynamoClient: DynamoDBClient) => {
  const command = new CreateTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-frontend-sessions`,
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
  await dynamoClient.send(command);
};

const deleteSessionTable = async (dynamoClient: DynamoDBClient) => {
  const command = new DeleteTableCommand({
    TableName: `${process.env.VITEST_WORKER_ID}-frontend-sessions`,
  });

  await dynamoClient.send(command);
};
