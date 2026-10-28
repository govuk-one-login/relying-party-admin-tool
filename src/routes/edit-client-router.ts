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
import {
  editBackchannelLogoutUrlGet,
  editBackchannelLogoutUrlPost,
} from "../components/clients/edit-backchannel-logout-url/edit-backchannel-logout-url-controller.js";
import { validateEditBackchannelLogoutUrlRequest } from "../components/clients/edit-backchannel-logout-url/edit-backchannel-logout-url-validation.js";
import {
  editPostLogoutRedirectUrlsGet,
  editPostLogoutRedirectUrlsPost,
} from "../components/clients/edit-post-logout-redirect-urls/edit-post-logout-redirect-urls-controller.js";
import { validateEditPostLogoutRedirectUrlsRequest } from "../components/clients/edit-post-logout-redirect-urls/edit-post-logout-redirect-urls-validation.js";
import {
  editServiceTypeGet,
  editServiceTypePost,
} from "../components/clients/edit-service-type/edit-service-type-controller.js";
import { validateEditServiceTypeRequest } from "../components/clients/edit-service-type/edit-service-type-validation.js";
import {
  editSectorIdentifierUriGet,
  editSectorIdentifierUriPost,
} from "../components/clients/edit-sector-identifier-uri/edit-sector-identifier-uri-controller.js";
import { validateEditSectorIdentifierUriRequest } from "../components/clients/edit-sector-identifier-uri/edit-sector-identifier-uri-validation.js";
import {
  editJarValidationRequiredGet,
  editJarValidationRequiredPost,
} from "../components/clients/edit-jar-validation-required/edit-jar-validation-required-controller.js";
import { validateEditJarValidationRequiredRequest } from "../components/clients/edit-jar-validation-required/edit-jar-validation-required-validation.js";
import {
  editChannelGet,
  editChannelPost,
} from "../components/clients/edit-channel/edit-channel-controller.js";
import { validateEditChannelRequest } from "../components/clients/edit-channel/edit-channel-validation.js";
import {
  editPKCEEnforcedGet,
  editPKCEEnforcedPost,
} from "../components/clients/edit-pkce-enforced/edit-pkce-enforced-controller.js";
import { validateEditPKCEEnforcedRequest } from "../components/clients/edit-pkce-enforced/edit-pkce-enforced-validation.js";
import { checkIntegrationWriterPermissionsMiddleware } from "../middleware/permissions-check-middleware.js";
import {
  editMaxAgeEnabledGet,
  editMaxAgeEnabledPost,
} from "../components/clients/edit-max-age-enabled/edit-max-age-enabled-controller.js";
import { validateEditMaxAgeEnabledRequest } from "../components/clients/edit-max-age-enabled/edit-max-age-enabled-validation.js";
import {
  editPermitMissingNonceGet,
  editPermitMissingNoncePost,
} from "../components/clients/edit-permit-missing-nonce/edit-permit-missing-nonce-controller.js";
import { validateEditPermitMissingNonceRequest } from "../components/clients/edit-permit-missing-nonce/edit-permit-missing-nonce-validation.js";
import { serviceExistsMiddleware } from "../middleware/check-service-exists-middleware.js";
import {
  editRateLimitGet,
  editRateLimitPost,
} from "../components/clients/edit-rate-limit/edit-rate-limit-controller.js";
import { validateEditRateLimitRequest } from "../components/clients/edit-rate-limit/edit-rate-limit-validation.js";
import { checkClientExistsForEnvMiddleware } from "../middleware/check-client-exists-middleware.js";
import { ClientEnvironment } from "../models/client-environment.js";
import {
  editClientNameGet,
  editClientNamePost,
} from "../components/clients/edit-client-name/edit-client-name-controller.js";
import { validateEditClientNameRequest } from "../components/clients/edit-client-name/validation.js";
import {
  editScopesGet,
  editScopesPost,
} from "../components/clients/edit-scopes/edit-scopes-controller.js";
import { validateEditScopesRequest } from "../components/clients/edit-scopes/validation.js";
import {
  editRedirectUrlsGet,
  editRedirectUrlsPost,
} from "../components/clients/edit-redirect-urls/edit-redirect-urls-controller.js";
import { validateEditRedirectUrlsRequest } from "../components/clients/edit-redirect-urls/validation.js";

const router = express.Router();

router.use(
  PATH_NAMES.CLIENT_EDIT_BASE_URL,
  serviceExistsMiddleware,
  checkClientExistsForEnvMiddleware(ClientEnvironment.INTEGRATION),
  checkIntegrationWriterPermissionsMiddleware
);

router.get(
  PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL,
  editBackchannelLogoutUrlGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_BACKCHANNEL_LOGOUT_URL,
  validateEditBackchannelLogoutUrlRequest(),
  editBackchannelLogoutUrlPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_CHANNEL, editChannelGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_CHANNEL,
  validateEditChannelRequest(),
  editChannelPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_CLIENT_NAME, editClientNameGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_CLIENT_NAME,
  validateEditClientNameRequest(),
  editClientNamePost()
);

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

router.get(
  PATH_NAMES.CLIENT_EDIT_JAR_VALIDATION_REQUIRED,
  editJarValidationRequiredGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_JAR_VALIDATION_REQUIRED,
  validateEditJarValidationRequiredRequest(),
  editJarValidationRequiredPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED, editMaxAgeEnabledGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_MAX_AGE_ENABLED,
  validateEditMaxAgeEnabledRequest(),
  editMaxAgeEnabledPost()
);

router.get(
  PATH_NAMES.CLIENT_EDIT_PERMIT_MISSING_NONCE,
  editPermitMissingNonceGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_PERMIT_MISSING_NONCE,
  validateEditPermitMissingNonceRequest(),
  editPermitMissingNoncePost()
);

router.get(PATH_NAMES.CLIENT_EDIT_PKCE_ENFORCED, editPKCEEnforcedGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_PKCE_ENFORCED,
  validateEditPKCEEnforcedRequest(),
  editPKCEEnforcedPost()
);

router.get(
  PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
  editPostLogoutRedirectUrlsGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_POST_LOGOUT_REDIRECT_URLS,
  validateEditPostLogoutRedirectUrlsRequest(),
  editPostLogoutRedirectUrlsPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_RATE_LIMIT, editRateLimitGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_RATE_LIMIT,
  validateEditRateLimitRequest(),
  editRateLimitPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_REDIRECT_URLS, editRedirectUrlsGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_REDIRECT_URLS,
  validateEditRedirectUrlsRequest(),
  editRedirectUrlsPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_SCOPES, editScopesGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_SCOPES,
  validateEditScopesRequest(),
  editScopesPost()
);

router.get(
  PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI,
  editSectorIdentifierUriGet()
);

router.post(
  PATH_NAMES.CLIENT_EDIT_SECTOR_IDENTIFIER_URI,
  validateEditSectorIdentifierUriRequest(),
  editSectorIdentifierUriPost()
);

router.get(PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE, editServiceTypeGet());

router.post(
  PATH_NAMES.CLIENT_EDIT_SERVICE_TYPE,
  validateEditServiceTypeRequest(),
  editServiceTypePost()
);

export { router as editClientRouter };
