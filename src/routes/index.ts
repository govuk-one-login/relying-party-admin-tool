import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.get(PATH_NAMES.ROOT, (_req, res) => {
  fetch(`https://${process.env.RP_CONFIG_API}/clients/test-client-id`)
    .then(async (response) => {
      logger.info(`Response is ${response.status}`);
      logger.info(await response.text());
      let headers = "Headers: ";
      response.headers.forEach(
        (key, value) => (headers += `${key} = ${value},`)
      );
      logger.info(headers);
    })
    .catch((err) => {
      logger.error(
        `Error when trying to invoke client registry API - ${(err as Error).message}`
      );
    });
  res.render("home/index.njk");
});

router.get(PATH_NAMES.COOKIES, (_req, res) => {
  res.render("common/cookies/index.njk");
});

export { router as indexRouter };
