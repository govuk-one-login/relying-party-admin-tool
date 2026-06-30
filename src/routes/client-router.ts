import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { createClientStartGet } from "../components/create-client/create-client-controller.js";
import {
  createClientEnterClientNameGet,
  createClientEnterClientNamePost,
} from "../components/create-client/enter-client-name/enter-client-name-controller.js";
import { validateEnterClientNameRequest } from "../components/create-client/enter-client-name/enter-client-name-validation.js";

const router = express.Router();

router.get(PATH_NAMES.CREATE_CLIENT, createClientStartGet());

router.get(
  PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME,
  createClientEnterClientNameGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME,
  validateEnterClientNameRequest(),
  createClientEnterClientNamePost()
);

export { router as clientsRouter };
