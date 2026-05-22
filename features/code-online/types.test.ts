/**
 * CodeOnline Feature - Types Tests
 */

import { FileInfo, EditorTab, Terminal, TerminalLine, LocalFolder, FileSource, RunConfiguration, RunResult, RunState, RunEnvironment } from "./types";

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

  describe("Git Types", () => {
    it("should define GitRepository structure correctly", () => {
      const repo = {
        id: "1",
        name: "test-repo",
        url: "https://github.com/user/test-repo",
        branch: "main",
        isPrivate: false,
      };

      expect(repo.name).toBe("test-repo");
      expect(repo.branch).toBe("main");
      expect(repo.isPrivate).toBe(false);
    });

    it("should define GitCommit structure correctly", () => {
      const commit = {
        id: "abc123",
        message: "Initial commit",
        author: "John Doe",
        timestamp: new Date(),
        sha: "abc123def456",
      };

      expect(commit.message).toBe("Initial commit");
      expect(commit.author).toBe("John Doe");
      expect(commit.sha).toBe("abc123def456");
    });

    it("should define GitFileChange with correct statuses", () => {
      const addedChange = {
        id: "1",
        path: "new-file.js",
        status: "added" as const,
        additions: 10,
        deletions: 0,
      };

      const modifiedChange = {
        id: "2",
        path: "modified.js",
        status: "modified" as const,
        additions: 5,
        deletions: 3,
      };

      expect(addedChange.status).toBe("added");
      expect(modifiedChange.status).toBe("modified");
    });

    it("should define GitBranch with current and remote flags", () => {
      const localBranch = {
        id: "main",
        name: "main",
        isCurrent: true,
        isRemote: false,
      };

      const remoteBranch = {
        id: "origin-main",
        name: "origin/main",
        isCurrent: false,
        isRemote: true,
      };

      expect(localBranch.isCurrent).toBe(true);
      expect(localBranch.isRemote).toBe(false);
      expect(remoteBranch.isRemote).toBe(true);
    });

    it("should define GitState with optional error", () => {
      const state = {
        repository: undefined,
        branches: [],
        changes: [],
        commits: [],
        isLoading: false,
      };

      expect(state.repository).toBeUndefined();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("Local Folder Types", () => {
    it("should define LocalFolder structure correctly", () => {
      const folder: LocalFolder = {
        name: "my-project",
        handle: {} as FileSystemDirectoryHandle,
        path: "/my-project",
      };

      expect(folder.name).toBe("my-project");
      expect(folder.path).toBe("/my-project");
    });

    it("should define FileSource as union type", () => {
      const gitSource: FileSource = "git";
      const localSource: FileSource = "local";
      const noneSource: FileSource = "none";

      expect(gitSource).toBe("git");
      expect(localSource).toBe("local");
      expect(noneSource).toBe("none");
    });
  });

  describe("Run Types", () => {
    it("should define RunConfiguration structure correctly", () => {
      const config: RunConfiguration = {
        id: "config-1",
        name: "Dev Server",
        type: "node",
        command: "npm run dev",
        workingDirectory: "./",
      };

      expect(config.id).toBe("config-1");
      expect(config.name).toBe("Dev Server");
      expect(config.type).toBe("node");
      expect(config.command).toBe("npm run dev");
    });

    it("should define RunConfiguration with optional properties", () => {
      const config: RunConfiguration = {
        id: "config-2",
        name: "Python App",
        type: "python",
        command: "python main.py",
        workingDirectory: "./src",
        env: { NODE_ENV: "development" },
        args: ["--verbose"],
      };

      expect(config.env).toEqual({ NODE_ENV: "development" });
      expect(config.args).toEqual(["--verbose"]);
    });

    it("should define RunResult structure correctly", () => {
      const result: RunResult = {
        id: "run-1",
        configurationId: "config-1",
        startTime: new Date(),
        status: "running",
        output: "Process output...",
      };

      expect(result.id).toBe("run-1");
      expect(result.status).toBe("running");
      expect(result.output).toBe("Process output...");
    });

    it("should define RunResult with completed status", () => {
      const result: RunResult = {
        id: "run-2",
        configurationId: "config-1",
        startTime: new Date(),
        endTime: new Date(),
        status: "success",
        output: "Completed",
        exitCode: 0,
      };

      expect(result.status).toBe("success");
      expect(result.exitCode).toBe(0);
    });

    it("should define RunState with configurations and runs", () => {
      const state: RunState = {
        configurations: [],
        activeRuns: [],
        isRunning: false,
      };

      expect(state.configurations).toHaveLength(0);
      expect(state.isRunning).toBe(false);
    });

    it("should define RunEnvironment as union type", () => {
      const nodeEnv: RunEnvironment = "node";
      const pythonEnv: RunEnvironment = "python";
      const browserEnv: RunEnvironment = "browser";
      const customEnv: RunEnvironment = "custom";

      expect(nodeEnv).toBe("node");
      expect(pythonEnv).toBe("python");
      expect(browserEnv).toBe("browser");
      expect(customEnv).toBe("custom");
    });
  });
});