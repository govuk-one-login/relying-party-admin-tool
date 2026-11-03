import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { checkReaderPermissionsMiddleware } from "../middleware/permissions-check-middleware.js";
import { serviceExistsMiddleware } from "../middleware/check-service-exists-middleware.js";
import { viewClientGet } from "../components/clients/clients-controller.js";
import { checkClientExistsForEnvMiddleware } from "../middleware/check-client-exists-middleware.js";
import { ClientEnvironment } from "../models/client-environment.js";

const router = express.Router();

router.use(
  PATH_NAMES.CLIENT,
  serviceExistsMiddleware,
  checkClientExistsForEnvMiddleware(ClientEnvironment.INTEGRATION),
  checkReaderPermissionsMiddleware
);

router.get(PATH_NAMES.CLIENT, viewClientGet());

export { router as clientRouter };
