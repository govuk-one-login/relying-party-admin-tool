import crypto from "crypto";
import {
  PROHIBITED_REDIRECT_URI_QUERY_PARAMETER_NAMES,
  PROHIBITED_REDIRECT_URI_SCHEMES,
  VALID_CLAIMS,
  VALID_SCOPES,
  VALID_TOKEN_SIGNING_ALGS,
} from "../app.constants.js";
import { isProductionEnv } from "../config.js";
import { isValidUrl } from "./shared-validation-rules.js";
import {
  limitedValidValuesValidator,
  listLimitedValidValuesValidator,
  notHttpValidator,
  notLocalhostValidator,
  requiredValidator,
  validUrlValidator,
} from "./shared-validators.js";
import { rule, Validator, when } from "./validator.js";

export const productionUrlValidator = (
  urlFieldName: string
): Validator<string> =>
  when(
    isProductionEnv,
    notHttpValidator(urlFieldName).and(notLocalhostValidator(urlFieldName))
  );

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

export const validClaimsValidator = listLimitedValidValuesValidator(
  VALID_CLAIMS,
  "claim"
);

export const jwksUrlValidator = validUrlValidator("JWKS URL").and(
  when(
    isProductionEnv,
    notHttpValidator("JWKS URL").and(notLocalhostValidator("JWKS URL"))
  )
);

export const publicKeyValidator = rule((jwks: string) => {
  try {
    crypto.createPublicKey(jwks);
    return true;
  } catch {
    return false;
  }
}, "Please enter a valid PEM key");

export const idTokenSigningAlgorithmValidator = requiredValidator(
  "ID token signing algorithm is required"
).and(
  limitedValidValuesValidator(
    VALID_TOKEN_SIGNING_ALGS,
    "ID token signing algorithm"
  )
);

const validRedirectUrlQueryParamsValidator = (
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

const validRedirectUrlSchemeValidator = (
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

export const redirectUrlValidator = requiredValidator("Enter a redirect URL")
  .and(validUrlValidator("redirect URL"))
  .and(productionUrlValidator("redirect URL"))
  .and(
    validRedirectUrlQueryParamsValidator(
      "You have entered a redirect URL with an invalid query parameter name"
    )
  )
  .and(
    validRedirectUrlSchemeValidator(
      "You have entered a redirect URL with an invalid scheme"
    )
  );

export const validScopesValidator = listLimitedValidValuesValidator(
  VALID_SCOPES,
  "scope"
);
