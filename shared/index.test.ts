/**
 * Tests for Feature Index Exports
 */

import { FREE_MODELS, DEFAULT_MODEL } from "@/features/ai-chat";
import { defaultHtml, defaultCss, defaultJs } from "@/features/code-editor";
import { generatePreviewHtml } from "@/shared";

describe("Feature Exports", () => {
  describe("AI Chat Feature", () => {
    it("should export FREE_MODELS array", () => {
      expect(Array.isArray(FREE_MODELS)).toBe(true);
      expect(DEFAULT_MODEL).toBe("openrouter/free");
    });
  });

  describe("Code Editor Feature", () => {
    it("should export defaultHtml template", () => {
      expect(typeof defaultHtml).toBe("string");
    });

    it("should export defaultCss template", () => {
      expect(typeof defaultCss).toBe("string");
    });

    it("should export defaultJs template", () => {
      expect(typeof defaultJs).toBe("string");
    });
  });

  describe("Shared Feature", () => {
    it("should export generatePreviewHtml function", () => {
      expect(typeof generatePreviewHtml).toBe("function");
    });
  });
});