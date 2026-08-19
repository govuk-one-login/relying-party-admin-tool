import { Validator, invalid, valid, rule } from "./validator.js";

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
