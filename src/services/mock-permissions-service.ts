/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserPermission } from "../models/permissions.js";
import { ClientEnvironment } from "../types.js";
import { PermissionsService } from "./permissions-service.js";

export const mockPermissionsService: PermissionsService = {
  check: async (
    user: string,
    permission: UserPermission,
    service: string
  ): Promise<boolean> => {
    return Promise.resolve(true);
  },
  checkUserHasReaderPermissions: async (
    user: string,
    service: string
  ): Promise<boolean> => {
    // should check READER, WRITER_INT, WRITER_PROD, and MANAGER
    return Promise.resolve(true);
  },
  checkUserHasWriterPermissions: async (
    user: string,
    service: string,
    clientEnvironment: ClientEnvironment
  ): Promise<boolean> => {
    // should check WRITER_INT/WRITER_PROD (dependant on ClientEnvironment) and MANAGER
    return Promise.resolve(true);
  },
};
