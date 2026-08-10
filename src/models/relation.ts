import { UserPermission } from "./permissions.js";

export type Relation = {
  userId: string;
  object: string;
  relation: UserPermission;
};
