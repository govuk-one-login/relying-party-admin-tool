import "aws-sdk-client-mock-vitest/extend";
import { expect } from "vitest";
import {
  FieldError,
  FieldValidationResult,
  ValidationResult,
} from "./utils/types.js";

interface CustomMatchers<R = unknown> {
  toBeValid(): R;
  toBeInvalid(): R;
  toHaveInvalidErrors(expectedErrors: string[]): R;
  toHaveInvalidFieldErrors(expectedErrors: FieldError[]): R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeValid(received: ValidationResult) {
    const pass = received.isValid;

    return {
      pass,
      message: (): string =>
        pass
          ? `Expected validation result NOT to be valid, but it passed.`
          : `Expected validation result to be valid, but it failed with errors:\n${this.utils.printReceived(
              received.errors
            )}`,
    };
  },

  toBeInvalid(received: ValidationResult) {
    const pass = !received.isValid;

    return {
      pass,
      options: { isNot: this.isNot },
      message: (): string =>
        pass
          ? `Expected validation result NOT to be invalid, but it failed.`
          : `Expected validation result to be invalid, but it passed successfully.`,
    };
  },

  toHaveInvalidErrors(received: ValidationResult, expectedErrors: string[]) {
    const isInvalid = !received.isValid;

    if (!isInvalid) {
      return {
        pass: false,
        message: (): string =>
          `Expected validation result to have specific error texts, but it passed successfully without errors.`,
      };
    }

    const pass = this.equals(received.errors, expectedErrors);

    return {
      pass,
      message: (): string =>
        `Validation failed as expected, but the error texts did not match.\n\n` +
        `Expected: ${this.utils.printExpected(expectedErrors)}\n` +
        `Received: ${this.utils.printReceived(received.errors)}`,
    };
  },

  toHaveInvalidFieldErrors(
    received: FieldValidationResult,
    expectedErrors: FieldError[]
  ) {
    const isInvalid = !received.isValid;

    if (!isInvalid) {
      return {
        pass: false,
        message: (): string =>
          `Expected validation result to have specific error text, but it passed successfully without errors.`,
      };
    }

    const pass = this.equals(received.errors, expectedErrors);

    return {
      pass,
      message: (): string =>
        `Validation failed as expected, but the error texts did not match.\n\n` +
        `Expected: ${this.utils.printExpected(expectedErrors)}\n` +
        `Received: ${this.utils.printReceived(received.errors)}`,
    };
  },
});
