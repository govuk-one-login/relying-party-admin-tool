/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export const sanitizeRequestMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // because DOMPurify.sanitize will remove urls unless stated to skip
  const skipFields = new Set(["redirect-urls", "post-logout-redirect-urls"]);

  if (req.body && typeof req.body === "object") {
    // because DOMPurify.sanitize only sanitizes strings, we have to manually check other objects
    req.body = sanitizeObject(req.body, skipFields);
  }
  next();
};

const sanitizeObject = (
  obj: Record<string, any>,
  skipFields: Set<string>
): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (skipFields.has(key)) {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = purify.sanitize(value, { ALLOWED_TAGS: [] }).trim();
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value
        .map((item) =>
          typeof item === "string"
            ? purify.sanitize(item, { ALLOWED_TAGS: [] }).trim()
            : item
        )
        .filter((item) => item !== "");
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = sanitizeObject(value, skipFields);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
