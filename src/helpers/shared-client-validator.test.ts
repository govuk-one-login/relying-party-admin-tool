import { clientNameValidator } from "./shared-client-validator.js";

describe("shared client validator tests", () => {
  describe("client name validator", () => {
    it("should return invalid result when clientName has an invalid length", async () => {
      const name = "a".repeat(255);

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name must be less than 255 characters long",
      ]);
    });

    it("should return invalid result when clientName has non-ASCII characters", async () => {
      const name = "My 🆕 Client";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return invalid result when clientName starts with a colon", async () => {
      const name = ":My Test Client";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your client name cannot start with ':'",
      ]);
    });

    it("should return invalid result when clientName has only whitespace characters", async () => {
      const name = "    ";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Enter your client name",
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return invalid result when clientName is empty string", async () => {
      const name = "";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Enter your client name",
        "Your client name must only use ASCII characters",
      ]);
    });

    it("should return valid result when clientName starts and ends with a whitespace", async () => {
      const name = " test ";

      const result = await clientNameValidator.validate(name);

      expect(result).toBeValid();
    });
  });
});
