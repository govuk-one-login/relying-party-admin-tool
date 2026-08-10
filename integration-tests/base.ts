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

export enum Table {
  // eslint-disable-next-line no-unused-vars
  EMPTY,
  // eslint-disable-next-line no-unused-vars
  USER_PERMISSIONS,
  // eslint-disable-next-line no-unused-vars
  SERVICES,
}

export const setupUserPermissionsTable = () => {
  integrationTest.override("tables", [Table.USER_PERMISSIONS]);
};

export const setupServicesTable = () => {
  integrationTest.override("tables", [Table.SERVICES]);
};

export const integrationTest = test
  .extend("dynamoClient", async () => {
    return new DynamoDBClient({
      region: "eu-west-2",
      ...(process.env.DYNAMO_ENDPOINT && {
        endpoint: process.env.DYNAMO_ENDPOINT,
      }),
    });
  })
  .extend("dynamoDocClient", async ({ dynamoClient }) => {
    return DynamoDBDocument.from(dynamoClient);
  })
  .extend("tables", async () => {
    return [Table.EMPTY];
  })
  .extend("addUsersToDynamo", ({ dynamoDocClient }) => {
    return async (...users: User[]) => {
      for (const user of users) {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Item: {
            subject: `user:${user.id}`,
            email: user.email,
            name: user.name,
            sk: "user",
          },
        });
      }
    };
  })
  .extend("addUserRelationsToDynamo", ({ dynamoDocClient }) => {
    return async (...relations: Relation[]) => {
      for (const relation of relations) {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Item: {
            subject: `user:${relation.userId}`,
            sk: `relation#${relation.object}#${relation.relation}`,
            object: `${relation.object}`,
            relation: `${relation.relation}`,
          },
        });
      }
    };
  })
  .extend("getUserFromDynamo", ({ dynamoDocClient }) => {
    return async (userId: string) => {
      return (
        await dynamoDocClient.get({
          TableName: `${process.env.VITEST_WORKER_ID}-user-permissions`,
          Key: { subject: `user:${userId}` },
        })
      ).Item;
    };
  })
  .extend("addServicesToDynamo", ({ dynamoDocClient }) => {
    return async (...services: Service[]) => {
      for (const service of services) {
        await dynamoDocClient.put({
          TableName: `${process.env.VITEST_WORKER_ID}-services`,
          Item: {
            serviceId: service.serviceId,
            name: service.name,
            sk: "service",
          },
        });
      }
    };
  })
  .extend("getServiceFromDynamo", ({ dynamoDocClient }) => {
    return async (serviceId: string) => {
      return (
        await dynamoDocClient.get({
          TableName: `${process.env.VITEST_WORKER_ID}-services`,
          Key: { serviceId: serviceId },
        })
      ).Item;
    };
  });

integrationTest.beforeEach(async ({ dynamoClient, tables }) => {
  if (tables.includes(Table.USER_PERMISSIONS)) {
    await createUserPermissionsTable(dynamoClient);
    logger.info("Creating user permissions table");
  }
  if (tables.includes(Table.SERVICES)) {
    await createServicesTable(dynamoClient);
    logger.info("Creating services table");
  }
});

integrationTest.afterEach(async ({ dynamoClient, tables }) => {
  try {
    if (tables.includes(Table.USER_PERMISSIONS)) {
      await deleteUserPermissionsTable(dynamoClient);
      logger.info("Deleting user permissions table");
    }
    if (tables.includes(Table.SERVICES)) {
      await deleteServicesTable(dynamoClient);
      logger.info("Deleting services table");
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
