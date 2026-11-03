import type { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";

export const viewClientGet = (): ExpressRouteFunc => {
  return async (_req: Request, res: Response) => {
    // TODO: get client
    const client = {
      clientName: "test-client",
      clientJwtPublicKeySource: {
        type: "JWKS",
        jwksUrl: "https://example1.com",
      },
      clientTokenAuthMethod: {
        tokenAuthMethod: "private_key_jwt",
      },
      scopes: ["openid", "email"],
      redirectUrls: ["https://example2.com"],
      postLogoutRedirectUrls: [],
      serviceType: "MANDATORY",
      sectorIdentifierUri: "https://example3.com",
      subjectType: "pairwise",
      isActive: true,
      isDeprecated: false,
      cookieConsentShared: false,
      testClient: false,
      jarValidationRequired: false,
      claims: [],
      clientType: "web",
      identityVerificationSupported: false,
      oneLoginService: false,
      idTokenSigningAlgorithm: "ES256",
      smokeTest: false,
      landingPageUrl: undefined,
      clientLoCs: ["P0"],
      permitMissingNonce: false,
      channel: "web",
      maxAgeEnabled: false,
      pkceEnforced: false,
      organisationId: "test-org",
      serviceIntegrationId: "test-service-integration",
      rateLimit: 1,
      clientId: "random-client-id",
      created: "",
      lastModified: "",
    };
    res.render("clients/index.njk", {
      client,
    });
  };
};
