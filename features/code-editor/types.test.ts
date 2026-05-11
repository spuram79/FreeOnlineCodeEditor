/**
 * Tests for Code Editor Feature - Types
 */

import { Language, CodeState, LanguageOption } from "./types";

describe("Code Editor Types", () => {
  describe("Language type", () => {
    it("should accept valid language values", () => {
      const languages: Language[] = ["html", "css", "javascript", "python", "csharp", "java"];
      expect(languages).toHaveLength(6);
    });

    it("should be assignable from valid strings", () => {
      const lang: Language = "html";
      expect(lang).toBe("html");
    });
  });

  describe("CodeState type", () => {
    it("should have all required language properties", () => {
      const state: CodeState = {
        html: "",
        css: "",
        javascript: "",
        python: "",
        csharp: "",
        java: "",
      };

      expect(state).toHaveProperty("html");
      expect(state).toHaveProperty("css");
      expect(state).toHaveProperty("javascript");
      expect(state).toHaveProperty("python");
      expect(state).toHaveProperty("csharp");
      expect(state).toHaveProperty("java");
    });

    it("should allow string values for all properties", () => {
      const state: CodeState = {
        html: "<div>test</div>",
        css: ".test { color: red; }",
        javascript: "console.log('test');",
        python: "print('test')",
        csharp: "using System;",
        java: "public class Test {}",
      };

      expect(state.html).toContain("div");
      expect(state.css).toContain("color");
      expect(state.javascript).toContain("console");
      expect(state.python).toContain("print");
      expect(state.csharp).toContain("using");
      expect(state.java).toContain("class");
    });

    it("should handle empty strings", () => {
      const state: CodeState = {
        html: "",
        css: "",
        javascript: "",
        python: "",
        csharp: "",
        java: "",
      };

      expect(state.html).toBe("");
      expect(state.css).toBe("");
      expect(state.javascript).toBe("");
      expect(state.python).toBe("");
      expect(state.csharp).toBe("");
      expect(state.java).toBe("");
    });

    it("should handle large code strings", () => {
      const largeCode = "x".repeat(100000);
      const state: CodeState = {
        html: largeCode,
        css: "",
        javascript: "",
        python: "",
        csharp: "",
        java: "",
      };

      expect(state.html.length).toBe(100000);
    });
  });

  describe("LanguageOption interface", () => {
    it("should accept valid language options", () => {
      const option: LanguageOption = {
        id: "javascript",
        name: "JavaScript",
        icon: "🟨",
      };

      expect(option.id).toBe("javascript");
      expect(option.name).toBe("JavaScript");
      expect(option.icon).toBe("🟨");
    });

    it("should support all language types as id", () => {
      const options: LanguageOption[] = [
        { id: "html", name: "HTML", icon: "🌐" },
        { id: "css", name: "CSS", icon: "🎨" },
        { id: "javascript", name: "JavaScript", icon: "🟨" },
        { id: "python", name: "Python", icon: "🐍" },
        { id: "csharp", name: "C#", icon: "🔷" },
        { id: "java", name: "Java", icon: "☕" },
      ];

      expect(options).toHaveLength(6);
      options.forEach((option) => {
        expect(["html", "css", "javascript", "python", "csharp", "java"]).toContain(option.id);
      });
    });
  });
});