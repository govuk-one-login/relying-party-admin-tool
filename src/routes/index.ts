import express from "express";
import { isLocalEnv } from "../config.js";

const router = express.Router();

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get("/", function (req, res, _next) {
  res.render("home/index.njk", {
    isLocalEnv: isLocalEnv(),
    isAuthenticated: !!req.session?.user,
    user: req.session?.user,
  });
});

export { router as indexRouter };
