/**
 * Tests for Code Editor Feature - Templates
 */

import { 
  defaultHtml, 
  defaultCss, 
  defaultJs 
} from "../lib/web-templates";
import { defaultPython } from "../lib/python-template";
import { defaultCSharp } from "../lib/csharp-template";
import { defaultJava } from "../lib/java-template";

describe("Code Editor Templates", () => {
  describe("Web Templates", () => {
    it("should have valid HTML template", () => {
      expect(defaultHtml).toContain("<div");
      expect(defaultHtml).toContain("Hello, World");
    });

    it("should have valid CSS template", () => {
      expect(defaultCss).toContain(".container");
      expect(defaultCss).toContain("color");
    });

    it("should have valid JavaScript template", () => {
      expect(defaultJs).toContain("console.log");
      expect(defaultJs).toContain("addEventListener");
    });

    it("should have templates with reasonable length", () => {
      expect(defaultHtml.length).toBeGreaterThan(10);
      expect(defaultCss.length).toBeGreaterThan(10);
      expect(defaultJs.length).toBeGreaterThan(10);
    });
  });

  describe("Python Template", () => {
    it("should have valid Python code", () => {
      expect(defaultPython).toContain("def ");
      expect(defaultPython).toContain("print");
    });

    it("should include a greeting function", () => {
      expect(defaultPython).toContain("greet");
    });

    it("should include fibonacci sequence example", () => {
      expect(defaultPython).toContain("fibonacci");
    });
  });

  describe("C# Template", () => {
    it("should have valid C# code", () => {
      expect(defaultCSharp).toContain("using System");
      expect(defaultCSharp).toContain("namespace");
    });

    it("should have Main method", () => {
      expect(defaultCSharp).toContain("static void Main");
    });

    it("should include Console.WriteLine", () => {
      expect(defaultCSharp).toContain("Console.WriteLine");
    });
  });

  describe("Java Template", () => {
    it("should have valid Java code", () => {
      expect(defaultJava).toContain("public class");
      expect(defaultJava).toContain("public static void main");
    });

    it("should include System.out.println", () => {
      expect(defaultJava).toContain("System.out.println");
    });
  });

  describe("Edge cases", () => {
    it("should have templates that compile/run without syntax errors", () => {
      // Verify templates don't have obvious syntax issues
      expect(() => new Function(defaultJs)).not.toThrow();
    });

    it("should have HTML template with valid structure", () => {
      // HTML should have proper structure
      expect(defaultHtml).toContain("</div>");
      expect(defaultHtml).toContain("<div");
    });
  });
});