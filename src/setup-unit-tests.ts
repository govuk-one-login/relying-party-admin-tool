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
  toBeSuccess<T = any>(expectedValue?: T): R;
  toBeFailure<E = any>(expectedError?: E): R;
}

declare module "vitest" {
  interface Assertion<T> extends CustomMatchers<T> {}
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

  toBeSuccess(received, expectedValue?) {
    const { utils } = this;
    const isSuccess =
      received !== null &&
      typeof received === "object" &&
      received.success === true;

    if (!isSuccess) {
      return {
        pass: false,
        message: () =>
          `Expected a Success result, but received:\n${utils.printReceived(received)}`,
      };
    }

    if (arguments.length === 1) {
      return {
        pass: true,
        message: () => `Expected result NOT to be a Success.`,
      };
    }

    const pass = this.equals(received.value, expectedValue);

    return {
      pass,
      actual: received.value,
      expected: expectedValue,
      message: () =>
        pass
          ? `Expected Success value NOT to deeply equal ${utils.printExpected(expectedValue)}`
          : `Expected Success value to deeply equal ${utils.printExpected(expectedValue)}\n\nReceived: ${utils.printReceived(received.value)}`,
    };
  },

  toBeFailure(received, expectedError?) {
    const { utils } = this;
    const isFailure =
      received !== null &&
      typeof received === "object" &&
      received.success === false;

    if (!isFailure) {
      return {
        pass: false,
        message: () =>
          `Expected a Failure result, but received:\n${utils.printReceived(received)}`,
      };
    }

    if (arguments.length === 1) {
      return {
        pass: true,
        message: () => `Expected result NOT to be a Failure.`,
      };
    }

    const pass = this.equals(received.error, expectedError);

    return {
      pass,
      actual: received.error,
      expected: expectedError,
      message: () =>
        pass
          ? `Expected Failure error NOT to deeply equal ${utils.printExpected(expectedError)}`
          : `Expected Failure error to deeply equal ${utils.printExpected(expectedError)}\n\nReceived: ${utils.printReceived(received.error)}`,
    };
  },
});
