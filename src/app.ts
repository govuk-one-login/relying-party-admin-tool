import express, { Application } from "express";

import { indexRouter } from "./routes/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { configureNunjucks } from "./config/nunjucks.js";
import { logger, loggerMiddleware } from "./utils/logger.js";
import { frontendVitalSignsInit } from "@govuk-one-login/frontend-vital-signs";
import { getVitalSignsIntervalSeconds, isLocalEnv } from "./config.js";
import { Server } from "http";
import { applyOverloadProtection } from "./middleware/overload-protection-middleware.js";
import { healthcheckRouter } from "./components/healthcheck/healthcheck-routes.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const APP_VIEWS = [
  path.join(__dirname, "components"),
  path.resolve("node_modules/govuk-frontend/dist"),
  path.resolve("node_modules/@govuk-one-login/"),
];

async function createApp(): Promise<express.Application> {
  const app: express.Application = express();
  const isDeployedEnvironment = !isLocalEnv();

  app.enable("trust proxy");

  // @ts-expect-error HttpLogger type from pino-http doesn't match Express middleware signature
  app.use(loggerMiddleware);

  if (isDeployedEnvironment) {
    const protect = applyOverloadProtection(isDeployedEnvironment);
    app.use(protect);
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(healthcheckRouter);

  app.use(
    "/assets",
    express.static(
      path.resolve("node_modules/govuk-frontend/dist/govuk/assets"),
      { maxAge: isLocalEnv() ? "0" : "1y" },
    ),
  );

  app.use(
    "/public",
    express.static(path.join(__dirname, "public"), {
      maxAge: isLocalEnv() ? "0" : "1y",
    }),
  );

  app.use((req, res, next) => {
    void (async () => {
      req.log = req.log.child({
        trace: res.locals.trace,
      });
      next();
    })();
  });

  app.set("nunjucksEngine", configureNunjucks(app, APP_VIEWS));
  app.use((req, res, next) => {
    void (async () => {
      const engine = res.app.get("nunjucksEngine");
      engine.addGlobal("request", req);
      engine.addGlobal("response", res);
      next();
    })();
  });

  app.use("/", indexRouter);

  return app;
}

async function startServer(app: Application): Promise<{
  server: Server;
  closeServer: (callback?: (err?: Error) => void) => Promise<void>;
}> {
  const port: number | string = process.env.PORT || 6001;

  const server = await new Promise<Server>((resolve) => {
    const server = app
      .listen(port, () => {
        logger.info(`Server listening on port ${port}`);
        app.emit("appStarted");
        resolve(server);
      })
      .on("error", (error: Error) => {
        logger.error(`Unable to start server because of ${error.message}`);
      });

    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 91 * 1000;
  });

  const stopVitalSigns = frontendVitalSignsInit(server, {
    staticPaths: [/^\/assets\/.*/, /^\/public\/.*/],
    interval: getVitalSignsIntervalSeconds() * 1000,
  });

  const closeServer = async () => {
    if (stopVitalSigns) {
      stopVitalSigns();
      logger.info(`vital-signs stopped`);
    }
    await new Promise<void>((res, rej) =>
      server.close((err) => (err ? rej(err) : res())),
    );
  };

  return { server, closeServer };
}

const shutdownProcess =
  (closeServer: () => Promise<void>) => async (): Promise<void> => {
    try {
      logger.info("closing server");
      await closeServer();
      logger.info("server closed");
      process.exit(0);
    } catch (error) {
      logger.error(error, "error closing server");
      process.exit(1);
    }
  };

export { createApp, startServer, shutdownProcess };
