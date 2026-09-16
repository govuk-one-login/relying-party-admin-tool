import { HelmetOptions } from "helmet";
import { Response } from "express";
import { IncomingMessage } from "http";
import { ServerResponse } from "http";

// Helmet does not export the config type - This is the way the recommend getting it on GitHub.
export const helmetConfiguration: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (_req: IncomingMessage, res: ServerResponse): string =>
          // In our app this will always be an express response
          `'nonce-${(res as Response).locals.scriptNonce}'`,
        "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='", //pragma: allowlist secret
        "https://*.ruxit.com",
        "https://*.dynatrace.com",
      ],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      connectSrc: ["'self'", "https://*.ruxit.com", "https://*.dynatrace.com"],
      formAction: ["'self'"],
    },
  },
  dnsPrefetchControl: {
    allow: false,
  },
  frameguard: {
    action: "deny",
  },
  hsts: {
    maxAge: 31536000, // 1 Year
    preload: true,
    includeSubDomains: true,
  },
  referrerPolicy: false,
  permittedCrossDomainPolicies: {
    permittedPolicies: "none",
  },
};
