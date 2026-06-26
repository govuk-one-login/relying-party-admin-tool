import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { createClientStartGet } from "../components/create-client/create-client-controller.js";

const router = express.Router();

router.get(PATH_NAMES.CREATE_CLIENT, createClientStartGet());

export { router as clientsRouter };
