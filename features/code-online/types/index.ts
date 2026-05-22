/**
 * CodeOnline Feature - Types
 * 
 * VSCode-like editor types and interfaces.
 */

import React from "react";

// File system types
export interface FileInfo {
  id: string;
  name: string;
  path: string;
  extension: string;
  type: 'file' | 'folder';
  children?: FileInfo[];
  content?: string;
  language?: string;
}

// Editor tab types
export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

// Terminal types
export interface TerminalLine {
  id: string;
  content: string;
  type: 'input' | 'output' | 'error' | 'success';
  timestamp: Date;
}

export interface Terminal {
  id: string;
  name: string;
  lines: TerminalLine[];
  isActive: boolean;
}

// Status bar types
export interface StatusBarItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

// Activity bar types
export type ActivityView = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'terminal' | 'run';

export interface ActivityItem {
  id: ActivityView;
  label: string;
  icon: React.ReactNode;
}

// CodeOnline editor state
export interface CodeOnlineState {
  // File explorer
  rootFolder?: FileInfo;
  expandedFolders: Set<string>;
  selectedFile?: string;
  
  // Editor tabs
  tabs: EditorTab[];
  activeTabId?: string;
  
  // Terminals
  terminals: Terminal[];
  activeTerminalId?: string;
  isTerminalVisible: boolean;
  
  // Activity bar
  activeView: ActivityView;
  
  // Editor settings
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark';
  wordWrap: boolean;
  minimap: boolean;
}

// Editor position
export interface EditorPosition {
  lineNumber: number;
  column: number;
}

// Git types
export interface GitRepository {
  id: string;
  name: string;
  url: string;
  branch: string;
  isPrivate: boolean;
  lastCommit?: GitCommit;
}

export interface GitCommit {
  id: string;
  message: string;
  author: string;
  timestamp: Date;
  sha: string;
}

export interface GitFileChange {
  id: string;
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
}

export interface GitBranch {
  id: string;
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export interface GitState {
  repository?: GitRepository;
  branches: GitBranch[];
  changes: GitFileChange[];
  commits: GitCommit[];
  isLoading: boolean;
  error?: string;
}

// Git operations
export interface CloneOptions {
  url: string;
  branch?: string;
  directory?: string;
}

export interface CommitOptions {
  message: string;
  files?: string[];
}

export interface PushOptions {
  remote?: string;
  branch?: string;
}

export interface PullOptions {
  remote?: string;
  branch?: string;
}

// Local folder types
export type FileSource = 'git' | 'local' | 'none';

export interface LocalFolder {
  name: string;
  handle: FileSystemDirectoryHandle;
  path: string;
}

export interface OpenFolderOptions {
  source: FileSource;
  folder?: LocalFolder;
  gitUrl?: string;
  branch?: string;
}

// Run configuration types
export type RunEnvironment = 'node' | 'python' | 'browser' | 'custom';

export interface RunConfiguration {
  id: string;
  name: string;
  type: RunEnvironment;
  command: string;
  workingDirectory?: string;
  env?: Record<string, string>;
  args?: string[];
  outputFile?: string;
  apiKey?: {
    openrouter?: string;
  };
}

export interface RunResult {
  id: string;
  configurationId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'success' | 'error' | 'stopped';
  output: string;
  error?: string;
  exitCode?: number;
}

export interface RunState {
  configurations: RunConfiguration[];
  activeRuns: RunResult[];
  lastRun?: RunResult;
  isRunning: boolean;
}