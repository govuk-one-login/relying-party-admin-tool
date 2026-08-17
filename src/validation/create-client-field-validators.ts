import type { Request } from "express";
import { clientNameValidator } from "./shared-client-validators.js";
import { FieldValidator } from "./validator.js";

export const enterClientNameFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom((req: Request) => req.body.name as string),
  "name"
);
