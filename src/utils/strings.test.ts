import { generateNonce } from "./strings.js";

describe("string-helpers", () => {
  describe("generateNonce", () => {
    it("should generate a 32-character hexadecimal nonce", async () => {
      const nonce = await generateNonce();

      expect(nonce).toBeTypeOf("string");
      expect(nonce).toHaveLength(32);
      expect(nonce).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique nonces", async () => {
      const nonce1 = await generateNonce();
      const nonce2 = await generateNonce();

      expect(nonce1).not.toBe(nonce2);
    });
  });
});
