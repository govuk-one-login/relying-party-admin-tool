import express from "express";

const router = express.Router();

/* eslint-disable @typescript-eslint/no-unused-vars */
router.all("/{*any}", (req, res, next) => {
  res.render("common/errors/404.njk");
});

export { router as pageNotFoundRouter };
