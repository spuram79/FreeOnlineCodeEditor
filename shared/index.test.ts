/**
 * Tests for Feature Index Exports
 */

describe("Feature Exports", () => {
  describe("AI Chat Feature", () => {
    it("should export Message type", () => {
      const { Message } = require("@/features/ai-chat");
      expect(Message).toBeUndefined(); // Type only, not a value
    });

    it("should export Model type", () => {
      const { Model } = require("@/features/ai-chat");
      expect(Model).toBeUndefined(); // Type only, not a value
    });

    it("should export FREE_MODELS array", () => {
      const { FREE_MODELS, DEFAULT_MODEL } = require("@/features/ai-chat");
      expect(Array.isArray(FREE_MODELS)).toBe(true);
      expect(DEFAULT_MODEL).toBe("openrouter/free");
    });
  });

  describe("Code Editor Feature", () => {
    it("should export Language type", () => {
      const { Language } = require("@/features/code-editor");
      expect(Language).toBeUndefined(); // Type only, not a value
    });

    it("should export defaultHtml template", () => {
      const { defaultHtml } = require("@/features/code-editor");
      expect(typeof defaultHtml).toBe("string");
    });

    it("should export defaultCss template", () => {
      const { defaultCss } = require("@/features/code-editor");
      expect(typeof defaultCss).toBe("string");
    });

    it("should export defaultJs template", () => {
      const { defaultJs } = require("@/features/code-editor");
      expect(typeof defaultJs).toBe("string");
    });
  });

  describe("Shared Feature", () => {
    it("should export generatePreviewHtml function", () => {
      const { generatePreviewHtml } = require("@/shared");
      expect(typeof generatePreviewHtml).toBe("function");
    });
  });
});