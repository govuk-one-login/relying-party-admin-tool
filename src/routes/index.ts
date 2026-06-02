import express from "express";

const router = express.Router();

/* eslint-disable @typescript-eslint/no-unused-vars */
router.get("/", function (req, res, next) {
  res.render("home/index.njk");
});

export { router as indexRouter };
