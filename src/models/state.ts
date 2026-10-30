import { and, not, or, setup } from "xstate";
import { CoreClientConfig } from "../../@types/express/index.js";
import { PATH_NAMES } from "../app.constants.js";

export const createClientStateMachine = setup({
  types: {} as {
    input: CoreClientConfig;
    context: CoreClientConfig;
  },
  guards: {
    hasClientName: ({ context }) => typeof context.clientName === "string",
    hasJwksClientAuth: ({ context }) =>
      typeof context.jwksURL === "string" &&
      context.clientTokenAuthenticationMethod === "private_key_jwt",
    hasStaticKeyAuth: ({ context }) =>
      typeof context.publicKey === "string" &&
      context.clientTokenAuthenticationMethod === "private_key_jwt",
    hasClientSecretAuth: ({ context }) =>
      typeof context.clientSecret === "string" && // pragma: allowlist secret
      context.clientTokenAuthenticationMethod === "client_secret_post",
    hasRedirectUrls: ({ context }) =>
      typeof context.redirectUrls !== "undefined" &&
      context.redirectUrls.length >= 1,
    hasScopes: ({ context }) =>
      typeof context.scopes !== "undefined" && context.scopes.length >= 1,
    identitySelected: ({ context }) =>
      typeof context.isIdentityVerificationSupported !== "undefined",
    identityRequired: ({ context }) =>
      context.isIdentityVerificationSupported === true,
    hasClaims: ({ context }) =>
      typeof context.claims !== "undefined" && Array.isArray(context.claims),
    hasLandingPageUrl: ({ context }) =>
      typeof context.landingPageUrl === "string",
    hasClientLoCs: ({ context }) =>
      typeof context.loc !== "undefined" && context.loc.length >= 1,
  },
  actions: {
    removeIdentityFields: ({ context }) => {
      context.claims = [];
      context.loc = ["P0"];
      context.landingPageUrl = undefined;
    },
  },
}).createMachine({
  id: "CreateClientStateMachine",
  context: ({ input }) => input,
  initial: PATH_NAMES.CREATE_CLIENT,
  states: {
    [PATH_NAMES.CREATE_CLIENT]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME,
      },
    },
    [PATH_NAMES.CREATE_CLIENT_ENTER_CLIENT_NAME]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION,
        guard: "hasClientName",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_SELECT_CLIENT_AUTHENTICATION]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS,
        guard: or([
          "hasJwksClientAuth",
          "hasStaticKeyAuth",
          "hasClientSecretAuth",
        ]),
      },
    },
    [PATH_NAMES.CREATE_CLIENT_ENTER_REDIRECT_URLS]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES,
        guard: "hasRedirectUrls",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_SELECT_SCOPES]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT,
        guard: "hasScopes",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_IDENTITY_VERIFICATION_SUPPORT]: {
      always: [
        //These are evaluated in order
        {
          target: PATH_NAMES.CREATE_CLIENT_SUMMARY,
          guard: and(["identitySelected", not("identityRequired")]),
          actions: "removeIdentityFields",
        },
        {
          target: PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS,
          guard: and(["identitySelected", "identityRequired"]),
        },
      ],
    },
    [PATH_NAMES.CREATE_CLIENT_SELECT_CLAIMS]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL,
        guard: "hasClaims",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_ENTER_LANDING_PAGE_URL]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE,
        guard: "hasLandingPageUrl",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_SELECT_LEVELS_OF_CONFIDENCE]: {
      always: {
        target: PATH_NAMES.CREATE_CLIENT_SUMMARY,
        guard: "hasClientLoCs",
      },
    },
    [PATH_NAMES.CREATE_CLIENT_SUMMARY]: {
      type: "final",
    },
  },
});
