/**
 * Tests for Shared Utilities - Preview Utils
 */

import { generatePreviewHtml } from "./preview-utils";

describe("generatePreviewHtml", () => {
  describe("Positive scenarios", () => {
    it("should generate valid HTML document with basic content", () => {
      const html = "<h1>Hello</h1>";
      const css = "body { color: red; }";
      const js = "console.log('test');";

      const result = generatePreviewHtml(html, css, js);

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<html");
      expect(result).toContain("<head>");
      expect(result).toContain("<body>");
      expect(result).toContain(html);
      expect(result).toContain(css);
      expect(result).toContain(js);
    });

    it("should include correct meta tags", () => {
      const result = generatePreviewHtml("<p>Test</p>", "", "");

      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<meta name="viewport"');
    });

    it("should include style tag with CSS content", () => {
      const css = ".test { color: blue; }";
      const result = generatePreviewHtml("", css, "");

      expect(result).toContain("<style>");
      expect(result).toContain(css);
      expect(result).toContain("</style>");
    });

    it("should include script tag with JavaScript content", () => {
      const js = "const x = 1;";
      const result = generatePreviewHtml("", "", js);

      expect(result).toContain("<script>");
      expect(result).toContain(js);
      expect(result).toContain("</script>");
    });

    it("should handle empty strings", () => {
      const result = generatePreviewHtml("", "", "");

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<body>");
    });

    it("should handle special characters in HTML", () => {
      const html = "<div class='test'>&quot;quoted&quot;</div>";
      const result = generatePreviewHtml(html, "", "");

      expect(result).toContain(html);
    });

    it("should handle large HTML content", () => {
      const largeHtml = "<div>" + "x".repeat(100000) + "</div>";
      const result = generatePreviewHtml(largeHtml, "", "");

      expect(result).toContain(largeHtml);
    });

    it("should handle large CSS content", () => {
      const largeCss = ".test { " + "color: red; ".repeat(10000) + "}";
      const result = generatePreviewHtml("", largeCss, "");

      expect(result).toContain(largeCss);
    });

    it("should handle large JavaScript content", () => {
      const largeJs = "const x = " + "1 + ".repeat(10000) + "1;";
      const result = generatePreviewHtml("", "", largeJs);

      expect(result).toContain(largeJs);
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should properly escape script tags in JS content", () => {
      const js = "const template = '<div>content</div>';";
      const result = generatePreviewHtml("", "", js);

      expect(result).toContain(js);
    });

    it("should handle CSS with special characters", () => {
      const css = ":root { --color: #fff; } @media (max-width: 600px) { .test { margin: 0; } }";
      const result = generatePreviewHtml("", css, "");

      expect(result).toContain(css);
    });

    it("should handle HTML with embedded JavaScript", () => {
      const html = "<button onclick=\"alert('test')\">Click</button>";
      const result = generatePreviewHtml(html, "", "");

      expect(result).toContain(html);
    });

    it("should produce valid HTML structure", () => {
      const result = generatePreviewHtml("<p>Content</p>", "body {}", "console.log(1);");

      // Check structure order
      const htmlIndex = result.indexOf("<html");
      const headIndex = result.indexOf("<head>");
      const bodyIndex = result.indexOf("<body>");

      expect(headIndex).toBeGreaterThan(htmlIndex);
      expect(bodyIndex).toBeGreaterThan(headIndex);
    });

    it("should handle unicode characters", () => {
      const html = "<p>Hello 你好 مرحبا 🌍</p>";
      const css = ".test::before { content: '🎉'; }";
      const js = "console.log('你好世界');";

      const result = generatePreviewHtml(html, css, js);

      expect(result).toContain("你好");
      expect(result).toContain("مرحبا");
      expect(result).toContain("🌍");
      expect(result).toContain("🎉");
      expect(result).toContain("你好世界");
    });

    it("should handle multiline strings", () => {
      const html = `<div>
  <p>Multi line</p>
</div>`;
      const css = `body {
  margin: 0;
  padding: 0;
}`;
      const js = `function test() {
  return "multi";
}`;

      const result = generatePreviewHtml(html, css, js);

      expect(result).toContain("Multi line");
      expect(result).toContain("margin: 0");
      expect(result).toContain("return \"multi\"");
    });
  });

  describe("Security considerations", () => {
    it("should preserve XSS payloads as-is (caller's responsibility)", () => {
      const maliciousHtml = "<script>alert('xss')</script>";
      const result = generatePreviewHtml(maliciousHtml, "", "");

      // The function does not sanitize - caller must handle
      expect(result).toContain(maliciousHtml);
    });
  });
});