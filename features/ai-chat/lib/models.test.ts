/**
 * Tests for AI Chat Feature - Models Configuration
 */

import { FREE_MODELS, DEFAULT_MODEL } from "../lib/models";

describe("FREE_MODELS", () => {
  describe("Positive scenarios", () => {
    it("should contain at least 25 free models", () => {
      expect(FREE_MODELS.length).toBeGreaterThanOrEqual(25);
    });

    it("should have required fields for each model", () => {
      FREE_MODELS.forEach((model) => {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("name");
        expect(model).toHaveProperty("description");
      });
    });

    it("should have unique model IDs", () => {
      const ids = FREE_MODELS.map((model) => model.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should include the default openrouter/free model", () => {
      expect(FREE_MODELS.some((model) => model.id === "openrouter/free")).toBe(true);
    });

    it("should include popular models like Llama and Gemma", () => {
      expect(FREE_MODELS.some((model) => model.id.includes("llama"))).toBe(true);
      expect(FREE_MODELS.some((model) => model.id.includes("gemma"))).toBe(true);
    });

    it("should have non-empty name and description", () => {
      FREE_MODELS.forEach((model) => {
        expect(model.name.length).toBeGreaterThan(0);
        expect(model.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should not have duplicate model names", () => {
      const names = FREE_MODELS.map((model) => model.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have IDs starting with provider prefix", () => {
      FREE_MODELS.forEach((model) => {
        expect(model.id).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+/);
      });
    });

    it("should all be available free models from OpenRouter", () => {
      FREE_MODELS.forEach((model) => {
        // Models can be "openrouter/free" (auto-select) or end with ":free" suffix
        // Some models like openrouter/owl-alpha don't have :free suffix but are still free
        const isKnownFreePattern = 
          model.id.startsWith("openrouter/") || 
          model.id.endsWith(":free");
        expect(isKnownFreePattern).toBe(true);
      });
    });
  });
});

describe("DEFAULT_MODEL", () => {
  it("should be set to openrouter/free", () => {
    expect(DEFAULT_MODEL).toBe("openrouter/free");
  });

  it("should exist in FREE_MODELS array", () => {
    expect(FREE_MODELS.some((model) => model.id === DEFAULT_MODEL)).toBe(true);
  });
});