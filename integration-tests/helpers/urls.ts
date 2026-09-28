import { populateUrlRoute } from "../../src/utils/populate-url-route.js";

export const getServicePaths = (pathName: string): string => {
  return populateUrlRoute(pathName, {
    [":serviceId"]: "1",
    [":clientId"]: "1",
  });
};
