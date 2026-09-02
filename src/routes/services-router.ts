import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { serviceGet } from "../components/service/service-controller.js";
import { validateServiceRequest } from "../components/create-service/create-service-validation.js";
import { createServicePost } from "../components/create-service/create-service-controller.js";

const router = express.Router();

router.get(PATH_NAMES.SERVICES, (_req, res) => {
  res.render("services/index.njk");
});

router.get(PATH_NAMES.CREATE_SERVICE, (_req, res) => {
  res.render("create-service/index.njk");
});

router.post(
  PATH_NAMES.CREATE_SERVICE,
  validateServiceRequest(),
  createServicePost()
);

router.get(PATH_NAMES.SERVICE, serviceGet());

export { router as servicesRouter };
