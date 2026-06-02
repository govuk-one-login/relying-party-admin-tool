import pino from "pino";
import { pinoHttp } from "pino-http";
import { getLogLevel } from "../config.js";

const logger = pino({
  name: "di-relying-party-admin-tool-frontend",
  level: getLogLevel(),
  serializers: {
    req: (req) => {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        from: getRefererFrom(req.headers.referer),
      };
    },
    res: (res) => {
      return {
        status: res.statusCode,
        sessionId: res.locals.sessionId,
        clientSessionId: res.locals.clientSessionId,
        persistentSessionId: res.locals.persistentSessionId,
        trace: res.locals.trace,
      };
    },
  },
});

export function getRefererFrom(referer: string): string | undefined {
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.pathname + refererUrl.search;
    } catch (error) {
      console.error(`Logger: Error obtaining referer URL ${error}`);
      return undefined;
    }
  } else {
    return undefined;
  }
}

const ignorePaths = [
  "/public/style.css",
  "/public/scripts/govuk-frontend.min.js",
  "/healthcheck",
];

const loggerMiddleware = pinoHttp({
  logger: logger,
  wrapSerializers: false,
  autoLogging: { ignore: (req: Request) => ignorePaths.includes(req.url) },
  customErrorMessage: function (_error, res) {
    return "request errored with status code: " + res.statusCode;
  },
  customSuccessMessage: function (req, res) {
    if (res.statusCode === 404) {
      return "resource not found";
    }
    return `request completed with status code: ${res.statusCode}`;
  },
  customAttributeKeys: {
    responseTime: "timeTaken",
  },
});

export { logger, loggerMiddleware };
