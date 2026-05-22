/**
 * Tests for AI Chat Feature - Workspace Scanner
 */

import { scanWorkspace, ScanSummary } from "./workspace-scanner";

describe("scanWorkspace", () => {
  describe("Positive scenarios", () => {
    it("should return empty summary for empty folder", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [],
      });

      expect(result.totalFiles).toBe(0);
      expect(result.totalIssues).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.warnings).toBe(0);
      expect(result.suggestions).toBe(0);
      expect(result.results).toHaveLength(0);
    });

    it("should scan a single file with no issues", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "test.js",
            content: "// Clean code",
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
      expect(result.totalIssues).toBe(0);
    });

    it("should detect console.log statements", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "debug.js",
            content: "console.log('debug');",
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
      expect(result.totalIssues).toBeGreaterThan(0);
      expect(result.suggestions).toBeGreaterThan(0);
    });

    it("should detect TODO/FIXME comments", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "todo.js",
            content: "// TODO: implement this",
          },
        ],
      });

      expect(result.warnings).toBeGreaterThan(0);
    });

    it("should detect hardcoded secrets", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "config.js",
            content: "const apiKey = 'secret123';",
          },
        ],
      });

      expect(result.errors).toBeGreaterThan(0);
    });

    it("should detect empty blocks", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "empty.js",
            content: "function test() {}",
          },
        ],
      });

      expect(result.warnings).toBeGreaterThan(0);
    });

    it("should handle nested folders", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "folder",
            path: "src",
            children: [
              {
                type: "file",
                path: "index.js",
                content: "console.log('hello');",
              },
            ],
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
    });

    it("should return detailed results for each file", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "test.js",
            content: "console.log('test');",
          },
        ],
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].file).toBe("test.js");
      expect(result.results[0].issues).toBeDefined();
    });

    it("should count issues correctly", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "multi.js",
            content: "console.log('a'); console.log('b');",
          },
        ],
      });

      // Each console.log is detected, so we expect at least 1 (the scanner detects console.log)
      expect(result.totalIssues).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should handle files with no content property", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "nocontent.js",
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
      expect(result.totalIssues).toBe(0);
    });

    it("should handle null content", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "null.js",
            content: null as any,
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
    });

    it("should handle empty string content", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "empty.js",
            content: "",
          },
        ],
      });

      expect(result.totalFiles).toBe(1);
      expect(result.totalIssues).toBe(0);
    });

    it("should handle file structure that is not a folder", () => {
      const result = scanWorkspace({
        type: "file" as any,
        path: "direct.js",
      });

      expect(result.totalFiles).toBe(0);
    });

    it("should handle file with suspicious password pattern in different cases", () => {
      const result = scanWorkspace({
        type: "folder",
        path: "/",
        children: [
          {
            type: "file",
            path: "config.js",
            content: "const PASSWORD = 'test'; const Secret = 'x'; const TOKEN = 'y';",
          },
        ],
      });

      expect(result.errors).toBeGreaterThanOrEqual(1);
    });
  });
});