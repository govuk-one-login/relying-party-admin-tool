import express from "express";
import { PATH_NAMES } from "../app.constants.js";
import {
  editIdTokenSigningAlgorithmGet,
  editIdTokenSigningAlgorithmPost,
} from "../components/clients/edit-id-token-signing-algorithm/edit-id-token-signing-algorithm-controller.js";
import { validateEditIdTokenSigningAlgorithmRequest } from "../components/clients/edit-id-token-signing-algorithm/edit-id-token-signing-algorithm-validation.js";
import {
  editIsActiveGet,
  editIsActivePost,
} from "../components/clients/edit-is-active/edit-is-active-controller.js";
import { validateEditIsActiveRequest } from "../components/clients/edit-is-active/edit-is-active-validation.js";

const router = express.Router();

router.get(
  PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
  editIdTokenSigningAlgorithmGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_ID_TOKEN_SIGNING_ALGORITHM,
  validateEditIdTokenSigningAlgorithmRequest(),
  editIdTokenSigningAlgorithmPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_IS_ACTIVE, editIsActiveGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_IS_ACTIVE,
  validateEditIsActiveRequest(),
  editIsActivePost()
);

export { router as editClientRouter };
