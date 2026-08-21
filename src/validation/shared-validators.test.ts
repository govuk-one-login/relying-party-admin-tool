import {
  validUrlValidator,
  notHttpValidator,
  notLocalhostValidator,
} from "./shared-validators.js";

describe("shared client validator tests", () => {
  describe("validUrlValidator", () => {
    it("should return invalid result when url is an invalid url", async () => {
      const url = "not-a-url";

      const result = await validUrlValidator("test url").validate(url);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors(["Your test url must be a valid URL"]);
    });

    it("should return valid result when url is a valid url", async () => {
      const url = "http://url.com";

      const result = await validUrlValidator("test url").validate(url);

      expect(result).toBeValid();
    });
  });

  describe("notHttpValidator", () => {
    it("should return invalid result when url begins with http", async () => {
      const url = "http://url.com";

      const result = await notHttpValidator("test url").validate(url);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your test url does not have a valid URL protocol",
      ]);
    });

    it("should return valid result when url begins with https", async () => {
      const url = "https://url.com";

      const result = await notHttpValidator("test url").validate(url);

      expect(result).toBeValid();
    });
  });

  describe("notLocalhostValidator", () => {
    it("should return invalid result when url is a localhost url", async () => {
      const url = "http://localhost:3000";

      const result = await notLocalhostValidator("test url").validate(url);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your test url must not use a local hostname",
      ]);
    });

    it("should return invalid result when url is a localhost IP url", async () => {
      const url = "http://127.0.0.1:3000";

      const result = await notLocalhostValidator("test url").validate(url);

      expect(result).toBeInvalid();
      expect(result).toHaveInvalidErrors([
        "Your test url must not use a local hostname",
      ]);
    });

    it("should return valid result when url begins with http", async () => {
      const url = "http://url.com";

      const result = await notLocalhostValidator("test url").validate(url);

      expect(result).toBeValid();
    });
  });
});
