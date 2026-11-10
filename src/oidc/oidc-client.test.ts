import { Configuration, discovery } from "openid-client";
import { oidcCache } from "./oidc-cache.js";
import { configCacheKey, getOidcConfig } from "./oidc-client.js";

vi.mock(import("openid-client"), async (importOrignal) => ({
  ...(await importOrignal()),
  discovery: vi.fn(),
}));

describe("getOidcConfig tests", () => {
  const testIssuer = "https://oidc.example.com";
  const testClientId = "test-client-id";
  const mockConfig = new Configuration(
    {
      issuer: testIssuer,
    },
    testClientId
  );

  beforeEach(() => {
    oidcCache.clear();
  });

  it("returns the OIDC config if cached", async () => {
    // arrange
    oidcCache.set(configCacheKey, mockConfig, 10000);

    // act
    const config = await getOidcConfig({
      baseUrl: testIssuer,
      clientId: testClientId,
    });

    // assert
    expect(config).toBeSuccess(mockConfig);
    expect(discovery).not.toHaveBeenCalled();
  });

  it("fetches the oidc config if not present", async () => {
    // arrange
    vi.mocked(discovery).mockResolvedValue(mockConfig);

    // act
    const config = await getOidcConfig({
      baseUrl: testIssuer,
      clientId: testClientId,
    });

    // assert
    expect(config).toBeSuccess(mockConfig);
    expect(discovery).toHaveBeenCalled();
    expect(oidcCache.get(configCacheKey)).toStrictEqual(mockConfig);
  });

  it("returns a failure if it fails to fetch the config", async () => {
    // arrange
    const error = new Error("Failed to resolve base URL");
    vi.mocked(discovery).mockRejectedValue(error);

    // act
    const config = await getOidcConfig({
      baseUrl: testIssuer,
      clientId: testClientId,
    });

    // assert
    expect(config).toBeFailure(error);
    expect(discovery).toHaveBeenCalled();
    expect(oidcCache.get(configCacheKey)).toBeUndefined();
  });
});
