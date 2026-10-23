import { ClientEnvironment } from "../../src/models/client-environment.js";
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

export const createTestClient = (serviceId: string, clientId: string) => ({
  clientId,
  name: "Test Client",
  serviceId,
  env: ClientEnvironment.INTEGRATION,
});
