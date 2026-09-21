import express from "express";
import { PATH_NAMES } from "../app.constants.js";

const router = express.Router();

router.get(PATH_NAMES["500_ERROR"], (_req, res) => {
  res.status(500);
  res.render("common/errors/500.njk");
});

router.get(PATH_NAMES["403_ERROR"], (_req, res) => {
  res.status(403);
  res.render("common/errors/403.njk");
});

router.all("/{*any}", (_req, res) => {
  res.status(404);
  res.render("common/errors/404.njk");
});

export { router as pageNotFoundRouter };
