import type { Request } from "express";
import {
  clientNameValidator,
  redirectUrlValidator,
} from "./shared-client-validators.js";
import { FieldValidator } from "./validator.js";
import { listValidator, notEmptyListValidator } from "./shared-validators.js";

export const clientNameSummaryFieldValidator = new FieldValidator(
  clientNameValidator.adaptedFrom(
    (req: Request) => req.session.newClientData?.name ?? ""
  ),
  "name"
);

export const redirectUrlsSummaryFieldValidator = new FieldValidator(
  notEmptyListValidator("You must have at least one redirect URL")
    .and(listValidator(redirectUrlValidator))
    .adaptedFrom(
      (req: Request) => req.session.newClientData?.redirectUrls ?? []
    ),
  "redirect-urls"
);
