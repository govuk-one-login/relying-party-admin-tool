/* eslint-disable vitest/max-expects */
import { describe, it, expect } from "vitest";
import { helmetConfiguration } from "./helmet.js";
import { Request, Response } from "express";

function getNonceFunction(
  entries: any[]
  // eslint-disable-next-line no-unused-vars
): (req: Request, res: Response) => string {
  return entries.find((item) => typeof item === "function");
}

describe("helmet config", () => {
  it("should have contentSecurityPolicy defined", () => {
    expect(helmetConfiguration.contentSecurityPolicy).toBeDefined();
    expect(
      (helmetConfiguration.contentSecurityPolicy as any)?.directives
    ).toBeDefined();
  });

  it("should only have expected directives", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(Object.keys(directives!).sort()).toStrictEqual([
      "connectSrc",
      "defaultSrc",
      "formAction",
      "imgSrc",
      "objectSrc",
      "scriptSrc",
      "styleSrc",
    ]);
  });

  it("should have correct defaultSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.defaultSrc).toStrictEqual(["'self'"]);
  });

  it("should have correct scriptSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;
    const scriptSrc = directives?.scriptSrc as any[];

    expect(scriptSrc).toHaveLength(5);
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).toContain(
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='" // pragma: allowlist secret
    );
    expect(scriptSrc).toContain("https://*.ruxit.com");
    expect(scriptSrc).toContain("https://*.dynatrace.com");
    expect(getNonceFunction(scriptSrc)).toBeDefined();
  });

  it("should generate nonce in scriptSrc function", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;
    const scriptSrc = directives?.scriptSrc as any[];
    const nonceFunc = getNonceFunction(scriptSrc);

    const req = {} as Request;
    const res = { locals: { scriptNonce: "test-nonce-123" } } as Response;

    expect(nonceFunc(req, res)).toBe("'nonce-test-nonce-123'");
  });

  it("should have correct imgSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.imgSrc).toHaveLength(2);
    expect(directives?.imgSrc).toContain("'self'");
    expect(directives?.imgSrc).toContain("data:");
  });

  it("should have objectSrc set to none", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.objectSrc).toStrictEqual(["'none'"]);
  });

  it("should have correct connectSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.connectSrc).toHaveLength(3);
    expect(directives?.connectSrc).toContain("'self'");
    expect(directives?.connectSrc).toContain("https://*.ruxit.com");
    expect(directives?.connectSrc).toContain("https://*.dynatrace.com");
  });

  it("should have correct formAction directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.formAction).toHaveLength(1);
    expect(directives?.formAction).toContain("'self'");
  });

  it("should have correct styleSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.styleSrc).toHaveLength(1);
    expect(directives?.styleSrc).toContain("'self'");
  });

  it("should not have scriptSrcAttr directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.scriptSrcAttr).toBeUndefined();
  });

  it("should not have workerSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.workerSrc).toBeUndefined();
  });

  it("should not have mediaSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.mediaSrc).toBeUndefined();
  });

  it("should not have frameSrc directive", () => {
    const directives = (helmetConfiguration.contentSecurityPolicy as any)
      .directives;

    expect(directives?.frameSrc).toBeUndefined();
  });

  it("should have dnsPrefetchControl disabled", () => {
    expect(helmetConfiguration.dnsPrefetchControl).toStrictEqual({
      allow: false,
    });
  });

  it("should have frameguard set to deny", () => {
    expect(helmetConfiguration.frameguard).toStrictEqual({ action: "deny" });
  });

  it("should have correct hsts configuration", () => {
    expect(helmetConfiguration.hsts).toStrictEqual({
      maxAge: 31536000,
      preload: true,
      includeSubDomains: true,
    });
  });

  it("should have referrerPolicy disabled", () => {
    expect(helmetConfiguration.referrerPolicy).toBe(false);
  });

  it("should have permittedCrossDomainPolicies set to none", () => {
    expect(helmetConfiguration.permittedCrossDomainPolicies).toStrictEqual({
      permittedPolicies: "none",
    });
  });
});
