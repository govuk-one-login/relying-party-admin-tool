import express from "express";
import { PATH_NAMES } from "../app.constants.js";

const router = express.Router();

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get(PATH_NAMES.ROOT, (req, res, next) => {
  res.render("home/index.njk");
});

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get(PATH_NAMES["500_ERROR"], (req, res, next) => {
  res.render("common/errors/500.njk");
});

export { router as indexRouter };
