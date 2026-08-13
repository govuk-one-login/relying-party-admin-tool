import {
  FieldValidationResult,
  FieldError,
  ValidationResult,
} from "../utils/types.js";

export const validField = (): FieldValidationResult => ({ isValid: true });

export const invalidField = (errors: FieldError[]): FieldValidationResult => ({
  isValid: false,
  errors,
});

export const valid = (): ValidationResult => ({ isValid: true });

export const invalid = (errors: string[]): ValidationResult => ({
  isValid: false,
  errors,
});

export class Validator<T> {
  constructor(
    private readonly verify: (
      value: T
    ) => ValidationResult | Promise<ValidationResult>
  ) {}

  async validate(value: T): Promise<ValidationResult> {
    return this.verify(value);
  }

  and(other: Validator<T>): Validator<T> {
    return new Validator(async (value) => {
      const [v1, v2] = await Promise.all([
        this.verify(value),
        other.verify(value),
      ]);

      if (!v1.isValid || !v2.isValid) {
        return invalid([
          ...(v1.isValid ? [] : v1.errors),
          ...(v2.isValid ? [] : v2.errors),
        ]);
      }
      return valid();
    });
  }

  or(other: Validator<T>): Validator<T> {
    return new Validator(async (value) => {
      const v1 = await this.verify(value);
      if (v1.isValid) return v1;

      const v2 = await other.verify(value);
      if (v2.isValid) return v2;

      return invalid([...v1.errors, ...v2.errors]);
    });
  }

  adaptedFrom<U>(transformer: (input: U) => T): Validator<U> {
    return new Validator((input) => this.validate(transformer(input)));
  }
}

export const rule = <T>(
  predicate: (input: T) => boolean | Promise<boolean>,
  error: string | ((input: T) => string)
): Validator<T> => {
  return new Validator(async (input) => {
    const isValid = await predicate(input);

    if (isValid) {
      return valid();
    }

    return invalid([typeof error === "function" ? error(input) : error]);
  });
};

export const when = <T>(
  predicate: (input: T) => boolean,
  validator: Validator<T>
): Validator<T> => {
  return new Validator((input) =>
    predicate(input) ? validator.validate(input) : valid()
  );
};

export const optional = <T>(
  validator: Validator<T>
): Validator<T | undefined> => {
  return new Validator((input: T | undefined) =>
    input ? validator.validate(input) : valid()
  );
};

export class FieldValidator<T> {
  fieldName: string;
  validator: Validator<T>;
  constructor(validator: Validator<T>, fieldName: string) {
    this.fieldName = fieldName;
    this.validator = validator;
  }

  async validate(value: T): Promise<FieldValidationResult> {
    const result = await this.validator.validate(value);
    if (!result.isValid) {
      const errors = {
        fieldName: this.fieldName,
        text: result.errors,
      };
      return invalidField([errors]);
    }
    return validField();
  }
}
