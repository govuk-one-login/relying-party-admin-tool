import { ClientEnvironment } from "../models/client-environment.js";
import { UserPermission } from "../models/permissions.js";
import { mockPermissionsService } from "./mock-permissions-service.js";

export interface PermissionsService {
  check: (
    user: string,
    permission: UserPermission,
    service: string
  ) => Promise<boolean>;
  checkUserHasReaderPermissions: (
    user: string,
    service: string
  ) => Promise<boolean>;
  checkUserHasWriterPermissions: (
    user: string,
    service: string,
    clientEnvironment: ClientEnvironment
  ) => Promise<boolean>;
  checkUserHasManagerPermissions: (
    user: string,
    service: string
  ) => Promise<boolean>;
}

export const permissionsService: PermissionsService = mockPermissionsService;
