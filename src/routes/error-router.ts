import express from "express";

const router = express.Router();

router.all("/{*any}", (_req, res) => {
  res.render("common/errors/404.njk");
});

export { router as pageNotFoundRouter };
