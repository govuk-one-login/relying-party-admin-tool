export interface Error {
  text: string;
  href: string;
}

export interface Valid {
  isValid: true;
}

export interface Invalid {
  isValid: false;
  errors: string[];
}

export type ValidationResult = Valid | Invalid;

export type FieldValidationResult = Valid | InvalidField;

export interface FieldError {
  fieldName: string;
  text: string[];
}

export interface InvalidField {
  isValid: false;
  errors: FieldError[];
}
