import type { Request } from "express";
import { clientNameValidator } from "./shared-client-validators.js";
import { FieldValidator } from "./validator.js";

export const clientNameSummaryFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom(
    (req: Request) => req.session.newClientData?.name ?? ""
  ),
  "name"
);
