/* eslint-disable @typescript-eslint/no-unused-vars */

import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { validateServiceNameRequest } from "../components/create-service/create-service-validation.js";
import { createServicePost } from "../components/create-service/create-service-controller.js";

const router = express.Router();

router.get(PATH_NAMES.SERVICES, function (req, res, next) {
  res.render("services/index.njk");
});

router.get(PATH_NAMES.CREATE_SERVICE, function (req, res, next) {
  res.render("create-service/index.njk");
});

router.post(
  PATH_NAMES.CREATE_SERVICE,
  validateServiceNameRequest(),
  createServicePost()
);

export { router as servicesRouter };
