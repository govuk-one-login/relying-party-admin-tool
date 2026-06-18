export interface PermissionsService {
  check(user: string, permission: string, service: string): boolean;
}
