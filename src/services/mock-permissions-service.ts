import { ClientEnvironment } from "../models/client-environment.js";
import { UserPermission } from "../models/permissions.js";
import { PermissionsService } from "./permissions-service.js";

export const mockPermissionsService: PermissionsService = {
  check: async (
    _user: string,
    _permission: UserPermission,
    _service: string
  ): Promise<boolean> => {
    return true;
  },
  checkUserHasReaderPermissions: async (
    _user: string,
    _service: string
  ): Promise<boolean> => {
    return true;
  },
  checkUserHasWriterPermissions: async (
    _user: string,
    _service: string,
    _clientEnvironment: ClientEnvironment
  ): Promise<boolean> => {
    return true;
  },
  checkUserHasManagerPermissions: async (
    _user: string,
    _service: string
  ): Promise<boolean> => {
    return true;
  },
};
