/**
 * CodeOnline Feature - Types
 * 
 * VSCode-like editor types and interfaces.
 */

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
export type ActivityView = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'terminal';

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