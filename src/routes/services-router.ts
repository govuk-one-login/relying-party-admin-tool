import express from "express";
import { PATH_NAMES } from "../app.constants.js";

const router = express.Router();

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get(PATH_NAMES.SERVICES, function (req, res, next) {
  res.render("services/index.njk");
});

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get(PATH_NAMES.CREATE_SERVICE, function (req, res, next) {
  res.render("create-service/index.njk");
});

export { router as servicesRouter };
