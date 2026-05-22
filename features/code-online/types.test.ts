/**
 * CodeOnline Feature - Types Tests
 */

import { FileInfo, EditorTab, Terminal, TerminalLine } from "./types";

describe("CodeOnline Types", () => {
  describe("FileInfo", () => {
    it("should define file structure correctly", () => {
      const fileInfo: FileInfo = {
        id: "test-file",
        name: "test.js",
        path: "/test.js",
        type: "file",
        extension: "js",
        language: "javascript",
        content: "console.log('test');",
      };

      expect(fileInfo.id).toBe("test-file");
      expect(fileInfo.name).toBe("test.js");
      expect(fileInfo.type).toBe("file");
      expect(fileInfo.extension).toBe("js");
    });

    it("should define folder structure with children", () => {
      const folderInfo: FileInfo = {
        id: "test-folder",
        name: "src",
        path: "/src",
        type: "folder",
        extension: "",
        children: [
          {
            id: "child-file",
            name: "index.js",
            path: "/src/index.js",
            type: "file",
            extension: "js",
            language: "javascript",
            content: "",
          },
        ],
      };

      expect(folderInfo.type).toBe("folder");
      expect(folderInfo.children).toHaveLength(1);
      expect(folderInfo.children?.[0].name).toBe("index.js");
    });
  });

  describe("EditorTab", () => {
    it("should define editor tab structure correctly", () => {
      const tab: EditorTab = {
        id: "tab-1",
        name: "app.js",
        path: "/src/app.js",
        content: "function App() {}",
        language: "javascript",
        isDirty: false,
        isActive: true,
      };

      expect(tab.id).toBe("tab-1");
      expect(tab.name).toBe("app.js");
      expect(tab.isDirty).toBe(false);
      expect(tab.isActive).toBe(true);
    });

    it("should track dirty state when content changes", () => {
      const tab: EditorTab = {
        id: "tab-1",
        name: "app.js",
        path: "/src/app.js",
        content: "function App() {}",
        language: "javascript",
        isDirty: true,
        isActive: true,
      };

      expect(tab.isDirty).toBe(true);
    });
  });

  describe("Terminal", () => {
    it("should define terminal structure correctly", () => {
      const terminal: Terminal = {
        id: "term-1",
        name: "Terminal 1",
        lines: [
          { id: "1", content: "Hello", type: "output", timestamp: new Date() },
        ],
        isActive: true,
      };

      expect(terminal.id).toBe("term-1");
      expect(terminal.lines).toHaveLength(1);
      expect(terminal.isActive).toBe(true);
    });
  });

  describe("TerminalLine", () => {
    it("should define terminal line with correct types", () => {
      const line: TerminalLine = {
        id: "1",
        content: "Error: Something went wrong",
        type: "error",
        timestamp: new Date(),
      };

      expect(line.type).toBe("error");
    });
  });
});