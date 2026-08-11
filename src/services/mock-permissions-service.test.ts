import { UserPermission } from "../models/permissions.js";
import { ClientEnvironment } from "../types.js";
import { mockPermissionsService } from "./mock-permissions-service.js";

describe("mockPermissionsService", () => {
  describe("check", () => {
    it("check should return true for READER permissions", async () => {
      await expect(
        mockPermissionsService.check("", UserPermission.READER, "")
      ).resolves.toBe(true);
    });

    it("check should return true for WRITER_INT permissions", async () => {
      await expect(
        mockPermissionsService.check("", UserPermission.WRITER_INT, "")
      ).resolves.toBe(true);
    });

    it("check should return true for WRITER_PROD permissions", async () => {
      await expect(
        mockPermissionsService.check("", UserPermission.WRITER_PROD, "")
      ).resolves.toBe(true);
    });

    it("check should return true for MANAGER permissions", async () => {
      await expect(
        mockPermissionsService.check("", UserPermission.MANAGER, "")
      ).resolves.toBe(true);
    });
  });

  describe("checkUserHasReaderPermissions", () => {
    it("check should return true for any user", async () => {
      await expect(
        mockPermissionsService.checkUserHasReaderPermissions("", "")
      ).resolves.toBe(true);
    });
  });

  describe("checkUserHasWriterPermissions", () => {
    it("check should return true for any user in integration", async () => {
      await expect(
        mockPermissionsService.checkUserHasWriterPermissions(
          "",
          "",
          ClientEnvironment.INTEGRATION
        )
      ).resolves.toBe(true);
    });

    it("check should return true for any user in production", async () => {
      await expect(
        mockPermissionsService.checkUserHasWriterPermissions(
          "",
          "",
          ClientEnvironment.PRODUCTION
        )
      ).resolves.toBe(true);
    });
  });

  describe("checkUserHasManagerPermissions", () => {
    it("check should return true for any user", async () => {
      await expect(
        mockPermissionsService.checkUserHasManagerPermissions("", "")
      ).resolves.toBe(true);
    });
  });
});
