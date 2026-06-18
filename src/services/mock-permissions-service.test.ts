import { MockPermissionsService } from "./mock-permissions-service.js";

describe("MockPermissionsService", () => {
  it("check should always return true", () => {
    expect(MockPermissionsService.check("", "", "")).toBe(true);
  });
});
