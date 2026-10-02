import { Service } from "../models/service.js";
import { userPermissionsTableName } from "./user-permissions-data-store.js";
import { servicesTableName } from "./services-data-store.js";
import { UserPermission } from "../models/permissions.js";
import { dynamoDocClient } from "../utils/dynamo.js";

export const createNewServiceWithManagerUserPermissions = async (
  service: Service,
  userId: string
): Promise<void> => {
  const object = `service:${service.serviceId}`;
  await dynamoDocClient.transactWrite({
    TransactItems: [
      {
        ConditionCheck: {
          TableName: userPermissionsTableName,
          Key: { subject: `user:${userId}`, sk: "user" },
          ConditionExpression: "attribute_exists(subject)",
        },
      },
      {
        Put: {
          TableName: servicesTableName,
          Item: {
            serviceId: service.serviceId,
            sk: "service",
            name: service.name,
          },
          ConditionExpression: "attribute_not_exists(serviceId)",
        },
      },
      {
        Put: {
          TableName: userPermissionsTableName,
          Item: {
            subject: `user:${userId}`,
            sk: `relation#${object}#${UserPermission.READER}`,
            object,
            relation: UserPermission.READER,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
      {
        Put: {
          TableName: userPermissionsTableName,
          Item: {
            subject: `user:${userId}`,
            sk: `relation#${object}#${UserPermission.WRITER_INT}`,
            object,
            relation: UserPermission.WRITER_INT,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
      {
        Put: {
          TableName: userPermissionsTableName,
          Item: {
            subject: `user:${userId}`,
            sk: `relation#${object}#${UserPermission.MANAGER}`,
            object,
            relation: UserPermission.MANAGER,
          },
          ConditionExpression: "attribute_not_exists(sk)",
        },
      },
    ],
  });
};
