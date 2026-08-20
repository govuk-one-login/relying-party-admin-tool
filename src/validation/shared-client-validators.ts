import { VALID_CLAIMS } from "../app.constants.js";
import { listFieldValidator } from "./shared-validators.js";
import { rule } from "./validator.js";

export const clientNameValidator = rule(
  (clientName: string) => clientName.trim() !== "",
  "Enter your client name"
)
  .and(
    rule(
      (clientName: string) => clientName.trim().length < 255,
      "Your client name must be less than 255 characters long"
    )
  )
  .and(
    rule(
      // eslint-disable-next-line no-control-regex
      (clientName: string) => /^[\x00-\x7F]{1,255}$/.test(clientName.trim()),
      "Your client name must only use ASCII characters"
    )
  )
  .and(
    rule(
      (clientName: string) => !clientName.trim().startsWith(":"),
      "Your client name cannot start with ':'"
    )
  );

export const validClaimsValidator = listFieldValidator(VALID_CLAIMS, "claim");
