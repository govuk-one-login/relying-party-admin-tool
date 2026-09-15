import express from "express";
import { PATH_NAMES } from "../app.constants.js";

const router = express.Router();

router.get(PATH_NAMES.ROOT, (_req, res) => {
  res.render("home/index.njk");
});

export { router as indexRouter };
