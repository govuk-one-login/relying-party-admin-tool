import { Response, Request } from "express";
import { HTTP_STATUS_CODES } from "../app.constants.js";

import { Error, FieldError } from "./types.js";

export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

export const generateErrorList = (errors: Record<string, Error>): Error[] => {
  if (!errors) return [];
  const errorValues = Object.values(errors);
  const uniqueErrorList = [
    ...new Map(errorValues.map((error) => [error.text, error])).values(),
  ];
  return uniqueErrorList;
};

export const validationErrorFormatter = (
  errors: FieldError[]
): Record<string, Error> => {
  const result: Record<string, Error> = Object.fromEntries(
    errors.map((error) => [
      error.fieldName,
      {
        text: error.text[0],
        href: `#${error.fieldName}`,
      },
    ])
  );
  return result;
};

export const renderBadRequest = (
  res: Response,
  req: Request,
  template: string,
  errors: Record<string, Error>,
  postValidationLocals?: Record<string, unknown>
): void => {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  res.render(template, {
    errors,
    errorList: generateErrorList(errors),
    ...req.body,
    ...postValidationLocals,
  });
};

export const renderBadRequestFields = (
  res: Response,
  req: Request,
  template: string,
  errors: FieldError[],
  postValidationLocals?: Record<string, unknown>
): void => {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  const formattedErrors = validationErrorFormatter(errors);

  res.render(template, {
    errors: formattedErrors,
    errorList: generateErrorList(formattedErrors),
    ...req.body,
    ...postValidationLocals,
  });
};
