import { FieldError } from "../utils/types.js";
import {
  FieldValidator,
  FieldValidatorChain,
  rule,
  when,
} from "./validator.js";

describe("custom validator tests", () => {
  describe("Validator tests", () => {
    const abcValidator = rule(
      (input: string) => input.includes("abc"),
      "String does not contain abc"
    );

    const defValidator = rule(
      (input: string) => input.includes("def"),
      "String does not contain def"
    );

    const xyzValidator = rule(
      (input: string) => input.includes("xyz"),
      "String does not contain xyz"
    );

    const allCapsValidator = rule(
      (input: string) => input === input.toUpperCase(),
      "String is not all caps"
    );

    it("should return valid result if one condition passed", async () => {
      const inputString = "test-abc";
      const result = await abcValidator.validate(inputString);

      expect(result).toBeValid();
    });

    it("should return invalid result with reason if one condition failed", async () => {
      const validator = abcValidator.and(defValidator);

      const inputString = "test-def";
      const result = await validator.validate(inputString);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors(["String does not contain abc"]);
    });

    it("should return invalid result with multiple errors if multiple conditions failed", async () => {
      const validator = abcValidator.and(defValidator).and(xyzValidator);

      const inputString = "test-ghi";
      const result = await validator.validate(inputString);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "String does not contain abc",
        "String does not contain def",
        "String does not contain xyz",
      ]);
    });

    it("should consider multiple validation chains", async () => {
      const validator = allCapsValidator.or(
        abcValidator.and(defValidator).and(xyzValidator)
      );

      const inputString = "ghi";
      const result = await validator.validate(inputString);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "String is not all caps",
        "String does not contain abc",
        "String does not contain def",
        "String does not contain xyz",
      ]);
    });

    it("should consider optional validation chains", async () => {
      const validator = when((input: string) => input.length > 0, abcValidator);

      const inputString = "";
      const result = await validator.validate(inputString);

      expect(result).toBeValid();
    });
  });

  describe("FieldValidator tests", () => {
    const abcValidator = rule(
      (input: string) => input.includes("abc"),
      "String does not contain abc"
    );

    const defValidator = rule(
      (input: string) => input.includes("def"),
      "String does not contain def"
    );

    const xyzValidator = rule(
      (input: string) => input.includes("xyz"),
      "String does not contain xyz"
    );

    const allCapsValidator = rule(
      (input: string) => input === input.toUpperCase(),
      "String is not all caps"
    );

    it("should return valid result if one condition passed", async () => {
      const inputString = "test-abc";
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(abcValidator, fieldName);
      const result = await fieldValidator.validate(inputString);

      expect(result).toBeValid();
    });

    it("should return invalid result with reason if one condition failed", async () => {
      const validator = abcValidator.and(defValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);

      const inputString = "test-def";
      const result = await fieldValidator.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: ["String does not contain abc"],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should return invalid result with multiple errors if multiple conditions failed", async () => {
      const validator = abcValidator.and(defValidator).and(xyzValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);

      const inputString = "test-ghi";
      const result = await fieldValidator.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: [
          "String does not contain abc",
          "String does not contain def",
          "String does not contain xyz",
        ],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should consider multiple validation chains", async () => {
      const validator = allCapsValidator.or(
        abcValidator.and(defValidator).and(xyzValidator)
      );
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);

      const inputString = "ghi";
      const result = await fieldValidator.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: [
          "String is not all caps",
          "String does not contain abc",
          "String does not contain def",
          "String does not contain xyz",
        ],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should consider optional validation chains", async () => {
      const validator = when((input: string) => input.length > 0, abcValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);

      const inputString = "";
      const result = await fieldValidator.validate(inputString);

      expect(result).toBeValid();
    });
  });

  describe("FieldValidatorChain tests", () => {
    const abcValidator = rule(
      (input: string) => input.includes("abc"),
      "String does not contain abc"
    );

    const defValidator = rule(
      (input: string) => input.includes("def"),
      "String does not contain def"
    );

    const xyzValidator = rule(
      (input: string) => input.includes("xyz"),
      "String does not contain xyz"
    );

    const allCapsValidator = rule(
      (input: string) => input === input.toUpperCase(),
      "String is not all caps"
    );

    it("should return valid result if one condition passed", async () => {
      const inputString = "test-abc";
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(abcValidator, fieldName);
      const fieldValidatorChain = new FieldValidatorChain([fieldValidator]);
      const result = await fieldValidatorChain.validate(inputString);

      expect(result).toBeValid();
    });

    it("should return invalid result with reason if one condition failed", async () => {
      const validator = abcValidator.and(defValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);
      const fieldValidatorChain = new FieldValidatorChain([fieldValidator]);

      const inputString = "test-def";
      const result = await fieldValidatorChain.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: ["String does not contain abc"],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should return invalid result with multiple errors if multiple conditions failed", async () => {
      const validator = abcValidator.and(defValidator).and(xyzValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);
      const fieldValidatorChain = new FieldValidatorChain([fieldValidator]);

      const inputString = "test-ghi";
      const result = await fieldValidatorChain.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: [
          "String does not contain abc",
          "String does not contain def",
          "String does not contain xyz",
        ],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should consider multiple validation chains", async () => {
      const validator = allCapsValidator.or(
        abcValidator.and(defValidator).and(xyzValidator)
      );
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);
      const fieldValidatorChain = new FieldValidatorChain([fieldValidator]);

      const inputString = "ghi";
      const result = await fieldValidatorChain.validate(inputString);

      const expectFieldError: FieldError = {
        fieldName,
        text: [
          "String is not all caps",
          "String does not contain abc",
          "String does not contain def",
          "String does not contain xyz",
        ],
      };

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors([expectFieldError]);
    });

    it("should consider optional validation chains", async () => {
      const validator = when((input: string) => input.length > 0, abcValidator);
      const fieldName = "test-field-name";
      const fieldValidator = new FieldValidator(validator, fieldName);
      const fieldValidatorChain = new FieldValidatorChain([fieldValidator]);

      const inputString = "";
      const result = await fieldValidatorChain.validate(inputString);

      expect(result).toBeValid();
    });

    it("should consider multiple FieldValidator validation chains", async () => {
      type TestType = {
        chain: string;
        caps: string;
      };
      const chainValidator = abcValidator.and(defValidator).and(xyzValidator);
      const allCapsFieldName = "all-caps-validator";
      const chainFieldName = "chain-validator";
      const allCapsFieldValidator = new FieldValidator(
        allCapsValidator.adaptedFrom((testType: TestType) => testType.caps),
        allCapsFieldName
      );
      const chainFieldValidator = new FieldValidator(
        chainValidator.adaptedFrom((testType: TestType) => testType.chain),
        chainFieldName
      );
      const fieldValidatorChain =
        allCapsFieldValidator.and(chainFieldValidator);

      const input: TestType = {
        chain: "ghi",
        caps: "not-caps",
      };
      const result = await fieldValidatorChain.validate(input);

      const expectFieldError: FieldError[] = [
        {
          fieldName: allCapsFieldName,
          text: ["String is not all caps"],
        },
        {
          fieldName: chainFieldName,
          text: [
            "String does not contain abc",
            "String does not contain def",
            "String does not contain xyz",
          ],
        },
      ];

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors(expectFieldError);
    });

    it("should consider multiple FieldValidator and FieldValidatorChain validation chains", async () => {
      type TestType = {
        abc: string;
        def: string;
        caps: string;
      };
      const allCapsFieldName = "all-caps-validator";
      const abcFieldName = "abc-validator";
      const defFieldName = "def-validator";
      const allCapsFieldValidator = new FieldValidator(
        allCapsValidator.adaptedFrom((testType: TestType) => testType.caps),
        allCapsFieldName
      );
      const abcFieldValidator = new FieldValidator(
        abcValidator.adaptedFrom((testType: TestType) => testType.abc),
        abcFieldName
      );
      const defFieldValidator = new FieldValidator(
        defValidator.adaptedFrom((testType: TestType) => testType.def),
        defFieldName
      );
      const fieldValidatorChain = allCapsFieldValidator
        .and(abcFieldValidator)
        .and(defFieldValidator);

      const input: TestType = {
        abc: "def",
        def: "abc",
        caps: "not-caps",
      };
      const result = await fieldValidatorChain.validate(input);

      const expectFieldError: FieldError[] = [
        {
          fieldName: allCapsFieldName,
          text: ["String is not all caps"],
        },
        {
          fieldName: abcFieldName,
          text: ["String does not contain abc"],
        },
        {
          fieldName: defFieldName,
          text: ["String does not contain def"],
        },
      ];

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidFieldErrors(expectFieldError);
    });
  });
});
