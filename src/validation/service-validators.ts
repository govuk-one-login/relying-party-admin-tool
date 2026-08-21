import type { Request } from "express";
import { FieldValidator, rule } from "./validator.js";
import { requiredValidator } from "./shared-validators.js";

const serviceNameValidator = requiredValidator("Enter your service name")
  .and(
    rule(
      (serviceName: string) => serviceName.trim().length < 255,
      "Your service name must be less than 255 characters long"
    )
  )
  .and(
    rule(
      // eslint-disable-next-line no-control-regex
      (serviceName: string) => /^[\x00-\x7F]{1,255}$/.test(serviceName.trim()),
      "Your service name must only use ASCII characters"
    )
  );

export const enterServiceNameFieldValidator = new FieldValidator(
  serviceNameValidator.adaptedFrom((req: Request) => req.body.name as string),
  "name"
);
