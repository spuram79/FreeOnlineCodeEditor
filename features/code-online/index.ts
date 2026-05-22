/**
 * CodeOnline Feature - Index
 * 
 * VSCode-like online code editor component.
 * Can be moved to a separate project by copying this folder.
 */

// Components
export { default as CodeOnline } from "./components/CodeOnline";
export { default as FileExplorer } from "./components/FileExplorer";
export { default as EditorTabs } from "./components/EditorTabs";
export { default as TerminalPanel } from "./components/TerminalPanel";
export { default as StatusBar } from "./components/StatusBar";
export { default as ActivityBar } from "./components/ActivityBar";

// Types
export type {
  FileInfo,
  EditorTab,
  Terminal,
  TerminalLine,
  StatusBarItem,
  ActivityItem,
  ActivityView,
  CodeOnlineState,
  EditorPosition,
} from "./types";