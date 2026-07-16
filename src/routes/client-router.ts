import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import {
  createClientStartGet,
  createClientStartPost,
} from "../components/create-client/create-client-controller.js";
import {
  createClientEnterClientNameGet,
  createClientEnterClientNamePost,
} from "../components/create-client/enter-client-name/enter-client-name-controller.js";
import { validateEnterClientNameRequest } from "../components/create-client/enter-client-name/enter-client-name-validation.js";
import {
  createClientSelectClientAuthenticationGet,
  createClientSelectClientAuthenticationPost,
} from "../components/create-client/select-client-authentication/select-client-authentication-controller.js";
import { validateSelectClientAuthenticationRequest } from "../components/create-client/select-client-authentication/select-client-authentication-validation.js";
import {
  createClientEnterRedirectUrlsGet,
  createClientEnterRedirectUrlsPost,
} from "../components/create-client/enter-redirect-urls/enter-redirect-urls-controller.js";
import { validateEnterRedirectUrlsRequest } from "../components/create-client/enter-redirect-urls/enter-redirect-urls-validation.js";

const router = express.Router();

router.get(PATH_NAMES.CREATE_CLIENT, createClientStartGet());

router.post(PATH_NAMES.CREATE_CLIENT, createClientStartPost());

router.get(
  PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME,
  createClientEnterClientNameGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME,
  validateEnterClientNameRequest(),
  createClientEnterClientNamePost()
);

router.get(
  PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION,
  createClientSelectClientAuthenticationGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION,
  validateSelectClientAuthenticationRequest(),
  createClientSelectClientAuthenticationPost()
);

router.get(
  PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
  createClientEnterRedirectUrlsGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
  validateEnterRedirectUrlsRequest(),
  createClientEnterRedirectUrlsPost()
);

export { router as clientsRouter };
