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
import {
  createClientSelectScopesGet,
  createClientSelectScopesPost,
} from "../components/create-client/select-scopes/select-scopes-controller.js";
import { validateSelectScopesRequest } from "../components/create-client/select-scopes/select-scopes-validation.js";
import {
  createClientIsIdentityVerificationSupportedGet,
  createClientIsIdentityVerificationSupportedPost,
} from "../components/create-client/support-identity-verification/support-identity-verification-controller.js";
import { validateIsIdentityVerificationSupportedRequest } from "../components/create-client/support-identity-verification/support-identity-verification-validation.js";
import {
  createClientSelectClaimsGet,
  createClientSelectClaimsPost,
} from "../components/create-client/select-claims/select-claims-controller.js";
import { validateSelectClaimsRequest } from "../components/create-client/select-claims/select-claims-validation.js";
import {
  createClientEnterLandingPageUrlGet,
  createClientEnterLandingPageUrlPost,
} from "../components/create-client/enter-landing-page-url/enter-landing-page-url-controller.js";
import { validateEnterLandingPageUrlRequest } from "../components/create-client/enter-landing-page-url/enter-landing-page-url-validation.js";
import {
  createClientSummaryGet,
  createClientSummaryPost,
} from "../components/create-client/summary/summary-controller.js";
import { validateCreateClientRequest } from "../components/create-client/summary/summary-validation.js";

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

router.get(
  PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
  createClientSelectScopesGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
  validateSelectScopesRequest(),
  createClientSelectScopesPost()
);

router.get(
  PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
  createClientIsIdentityVerificationSupportedGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
  validateIsIdentityVerificationSupportedRequest(),
  createClientIsIdentityVerificationSupportedPost()
);

router.get(
  PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS,
  createClientSelectClaimsGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS,
  validateSelectClaimsRequest(),
  createClientSelectClaimsPost()
);

router.get(
  PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
  createClientEnterLandingPageUrlGet()
);

router.post(
  PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
  validateEnterLandingPageUrlRequest(),
  createClientEnterLandingPageUrlPost()
);

router.get(PATH_NAMES.CREATE_CLIENT_SUMMARY, createClientSummaryGet());

router.post(
  PATH_NAMES.CREATE_CLIENT_SUMMARY,
  validateCreateClientRequest(),
  createClientSummaryPost()
);

export { router as clientsRouter };
