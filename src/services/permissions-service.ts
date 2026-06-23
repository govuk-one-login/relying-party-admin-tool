import { UserPermission } from "../models/permissions.js";
import { ClientEnvironment } from "../types.js";
import { mockPermissionsService } from "./mock-permissions-service.js";

export interface PermissionsService {
  check(user: string, permission: UserPermission, service: string): boolean;

  checkUserHasReaderPermissions(user: string, service: string): boolean;

  checkUserHasWriterPermissions(
    user: string,
    service: string,
    clientEnvironment: ClientEnvironment
  ): boolean;
}

export const permissionsService: PermissionsService = mockPermissionsService;
