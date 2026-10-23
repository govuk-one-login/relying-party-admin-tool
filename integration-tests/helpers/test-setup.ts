import { UserPermission } from "../../src/models/permissions.js";
import { Relation } from "../../src/models/relation.js";
import { Service } from "../../src/models/service.js";
import { User } from "../../src/models/user.js";
import { integrationTest } from "../base.js";

const baseExistingUser = {
  name: "Test User",
  email: "test@user.com",
};
const baseExistingRelation = {
  relation: UserPermission.WRITER_INT,
};
const baseExistingService = {
  name: "Test service",
};

export const setUpTestWithExistingUserAndService = async (
  addUserToDynamo: (user: User) => Promise<void>,
  addUserRelationToDynamo: (relation: Relation) => Promise<void>,
  addServiceToDynamo: (service: Service) => Promise<void>,
  existingUserId: string,
  serviceId: string
) => {
  const existingUser: User = {
    id: existingUserId,
    ...baseExistingUser,
  };
  const existingRelation: Relation = {
    userId: existingUserId,
    object: `service:${serviceId}`,
    ...baseExistingRelation,
  };
  const existingService: Service = {
    serviceId: serviceId,
    ...baseExistingService,
  };

  await addUserToDynamo(existingUser);
  await addUserRelationToDynamo(existingRelation);
  await addServiceToDynamo(existingService);
};

export const teardownTestWithExistingUserAndService = async (
  deleteUserFromDynamo: (user: User) => Promise<void>,
  deleteUserRelationFromDynamo: (relation: Relation) => Promise<void>,
  deleteServiceFromDynamo: (service: Service) => Promise<void>,
  existingUserId: string,
  serviceId: string
) => {
  const existingUser: User = {
    id: existingUserId,
    ...baseExistingUser,
  };
  const existingRelation: Relation = {
    userId: existingUserId,
    object: `service:${serviceId}`,
    ...baseExistingRelation,
  };
  const existingService: Service = {
    serviceId: serviceId,
    ...baseExistingService,
  };

  await deleteUserFromDynamo(existingUser);
  await deleteUserRelationFromDynamo(existingRelation);
  await deleteServiceFromDynamo(existingService);
};
