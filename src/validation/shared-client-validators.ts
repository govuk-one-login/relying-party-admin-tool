import {
  PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES,
  PROHIBITED_REDIRECT_URI_SCHEMES,
  VALID_CLAIMS,
  VALID_SCOPES,
} from "../app.constants.js";
import { isValidUrl } from "./shared-validation-rules.js";
import { listFieldValidator, requiredValidator } from "./shared-validators.js";
import { rule, Validator, when } from "./validator.js";

export const clientNameValidator = requiredValidator("Enter your client name")
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

export const validRedirectURLQueryParamsValidator = (
  errorMessage: string
): Validator<string> =>
  when(
    isValidUrl,
    rule((urlString: string) => {
      const url = new URL(urlString);

      let valid = true;
      url.searchParams.forEach((_value, key) => {
        if (PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES.includes(key)) {
          valid = false;
        }
      });
      return valid;
    }, errorMessage)
  );

export const validRedirectURLURISchemeValidator = (
  errorMessage: string
): Validator<string> =>
  when(
    isValidUrl,
    rule((urlString: string) => {
      const url = new URL(urlString);

      const urlScheme = url.protocol.replace(":", "");

      return !PROHIBITED_REDIRECT_URI_SCHEMES.includes(urlScheme);
    }, errorMessage)
  );

export const validScopesValidator = listFieldValidator(VALID_SCOPES, "scope");
