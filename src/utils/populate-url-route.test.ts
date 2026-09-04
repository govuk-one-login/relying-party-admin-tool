import { populateUrlRoute } from "./populate-url-route.js";

describe("populate url route", () => {
  it("should successfully populate unique parameters", () => {
    const testUrl = "/services/:serviceId/clients/:clientId";
    const parameterReplacements = { [":serviceId"]: "1", [":clientId"]: "29" };

    const result = populateUrlRoute(testUrl, parameterReplacements);

    expect(result).toBe("/services/1/clients/29");
  });

  it("should successfully populate duplicate parameters", () => {
    const testUrl = "/services/:serviceId/clients/:serviceId";
    const parameterReplacements = { [":serviceId"]: "1" };

    const result = populateUrlRoute(testUrl, parameterReplacements);

    expect(result).toBe("/services/1/clients/1");
  });

  it("should not fail if number of replacements is smaller than number of parameters", () => {
    const testUrl = "/services/:serviceId/clients/:clientId";
    const parameterReplacements = { [":serviceId"]: "1" };

    const result = populateUrlRoute(testUrl, parameterReplacements);

    expect(result).toBe("/services/1/clients/:clientId");
  });

  it("should not fail if number of replacements is larger than number of parameters", () => {
    const testUrl = "/services/:serviceId/clients/:clientId";
    const parameterReplacements = {
      [":serviceId"]: "1",
      [":clientId"]: "29",
      [":test"]: "56",
    };

    const result = populateUrlRoute(testUrl, parameterReplacements);

    expect(result).toBe("/services/1/clients/29");
  });
});
