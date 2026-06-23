import { UserPermission } from "../models/permissions.js";
import { ClientEnvironment } from "../types.js";
import { mockPermissionsService } from "./mock-permissions-service.js";

describe("mockPermissionsService", () => {
  describe("check", () => {
    it("check should return true for READER permissions", () => {
      expect(mockPermissionsService.check("", UserPermission.READER, "")).toBe(
        true
      );
    });

    it("check should return true for WRITER_INT permissions", () => {
      expect(
        mockPermissionsService.check("", UserPermission.WRITER_INT, "")
      ).toBe(true);
    });

    it("check should return true for WRITER_PROD permissions", () => {
      expect(
        mockPermissionsService.check("", UserPermission.WRITER_PROD, "")
      ).toBe(true);
    });

    it("check should return true for MANAGER permissions", () => {
      expect(mockPermissionsService.check("", UserPermission.MANAGER, "")).toBe(
        true
      );
    });
  });

  describe("checkUserHasReaderPermissions", () => {
    it("check should return true for any user", () => {
      expect(mockPermissionsService.checkUserHasReaderPermissions("", "")).toBe(
        true
      );
    });
  });

  describe("checkUserHasWriterPermissions", () => {
    it("check should return true for any user in integration", () => {
      expect(
        mockPermissionsService.checkUserHasWriterPermissions(
          "",
          "",
          ClientEnvironment.INTEGRATION
        )
      ).toBe(true);
    });

    it("check should return true for any user in production", () => {
      expect(
        mockPermissionsService.checkUserHasWriterPermissions(
          "",
          "",
          ClientEnvironment.PRODUCTION
        )
      ).toBe(true);
    });
  });
});
