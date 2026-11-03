import { ClientEnvironment } from "../../src/models/client-environment.js";
import { UserPermission } from "../../src/models/permissions.js";
import { populateUrlRoute } from "../../src/utils/populate-url-route.js";

export const getServicePaths = (
  pathName: string,
  serviceId = "1",
  clientId = "1"
): string => {
  return populateUrlRoute(pathName, {
    [":serviceId"]: serviceId,
    [":clientId"]: clientId,
  });
};

export function testComponent(componentId: string): string {
  return `[data-test-id='${componentId}']`;
}

export const createTestService = (serviceId: string) => ({
  serviceId,
  name: "Test service",
});

export const createTestUser = (userId: string) => ({
  name: "Test User",
  email: "test@user.com",
  id: userId,
});

export const createTestRelation = (serviceId: string, userId: string) => ({
  userId,
  object: `service:${serviceId}`,
  relation: UserPermission.WRITER_INT,
});

export const createTestClient = (serviceId: string, clientId: string) => ({
  clientId,
  name: "Test Client",
  serviceId,
  env: ClientEnvironment.INTEGRATION,
});
