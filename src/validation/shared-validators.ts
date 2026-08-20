import {
  isValidUrl,
  protocolNotHttp,
  isNotLocalhost,
} from "./shared-validation-rules.js";
import { invalid, rule, valid, Validator } from "./validator.js";

export const validUrlValidator = (fieldName: string): Validator<string> =>
  rule(isValidUrl, `Your ${fieldName} must be a valid URL`);

export const notHttpValidator = (fieldName: string): Validator<string> =>
  rule(protocolNotHttp, `Your ${fieldName} does not have a valid URL protocol`);

export const notLocalhostValidator = (fieldName: string): Validator<string> =>
  rule(isNotLocalhost, `Your ${fieldName} must not use a local hostname`);

const listValidator = <T>(validator: Validator<T>): Validator<T[]> => {
  return new Validator(async (values: T[]) => {
    const results = await Promise.all(
      values.map((value) => validator.validate(value))
    );
    const errors: string[] = results
      .filter((result) => !result.isValid)
      .flatMap((result) => result.errors);
    if (errors.length > 0) {
      return invalid(errors);
    }
    return valid();
  });
};

const fieldValidator = (
  validValues: readonly string[],
  fieldName: string
): Validator<string> =>
  rule(
    (value: string) => validValues.includes(value),
    (value: string) => `Invalid ${fieldName} provided: "${value}"`
  );

export const listFieldValidator = (
  validValues: readonly string[],
  fieldName: string
): Validator<string[]> => listValidator(fieldValidator(validValues, fieldName));

export const notEmptyListValidator = (
  errorMessage: string
): Validator<string[]> =>
  rule((input: string[]) => {
    return input.length > 0;
  }, errorMessage);

export const requiredValidator = (errorMessage: string): Validator<string> =>
  rule((input: string | string[]) => {
    return (
      input !== undefined &&
      (Array.isArray(input) ? input.length > 0 : input.trim() !== "")
    );
  }, errorMessage);
