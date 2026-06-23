/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserPermission } from "../models/permissions.js";
import { ClientEnvironment } from "../types.js";
import { PermissionsService } from "./permissions-service.js";

export const mockPermissionsService: PermissionsService = {
  check(user: string, permission: UserPermission, service: string): boolean {
    return true;
  },
  checkUserHasReaderPermissions(user: string, service: string): boolean {
    // should check READER, WRITER_INT, WRITER_PROD, and MANAGER
    return true;
  },
  checkUserHasWriterPermissions(
    user: string,
    service: string,
    clientEnvironment: ClientEnvironment
  ): boolean {
    // should check WRITER_INT/WRITER_PROD (dependant on ClientEnvironment) and MANAGER
    return true;
  },
};
