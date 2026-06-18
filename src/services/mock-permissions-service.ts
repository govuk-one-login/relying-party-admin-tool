import { PermissionsService } from "./permissions-service.js";

export const MockPermissionsService: PermissionsService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  check(user: string, permission: string, service: string): boolean {
    return true;
  },
};
