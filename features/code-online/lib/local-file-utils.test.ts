/**
 * CodeOnline Feature - Local File Utils Tests
 */

import { getLanguage, getFileExtension } from "../lib/local-file-utils";

describe("Local File Utils", () => {
  describe("getFileExtension", () => {
    it("should extract extension from filename", () => {
      expect(getFileExtension("test.js")).toBe("js");
      expect(getFileExtension("component.tsx")).toBe("tsx");
      expect(getFileExtension("styles.css")).toBe("css");
    });

    it("should return empty string for files without extension", () => {
      expect(getFileExtension("README")).toBe("");
      expect(getFileExtension(".gitignore")).toBe("gitignore");
    });

    it("should handle multiple dots in filename", () => {
      expect(getFileExtension("component.test.tsx")).toBe("tsx");
    });
  });

  describe("getLanguage", () => {
    it("should return correct language for JavaScript/TypeScript", () => {
      expect(getLanguage("js")).toBe("javascript");
      expect(getLanguage("jsx")).toBe("javascript");
      expect(getLanguage("ts")).toBe("typescript");
      expect(getLanguage("tsx")).toBe("typescript");
    });

    it("should return correct language for other common extensions", () => {
      expect(getLanguage("css")).toBe("css");
      expect(getLanguage("json")).toBe("json");
      expect(getLanguage("md")).toBe("markdown");
      expect(getLanguage("markdown")).toBe("markdown");
      expect(getLanguage("html")).toBe("html");
      expect(getLanguage("py")).toBe("python");
      expect(getLanguage("go")).toBe("go");
    });

    it("should return plaintext for unknown extensions", () => {
      expect(getLanguage("unknown")).toBe("plaintext");
      expect(getLanguage("xyz")).toBe("plaintext");
    });
  });
});