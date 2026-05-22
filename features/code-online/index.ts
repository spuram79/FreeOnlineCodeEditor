/**
 * CodeOnline Feature - Index
 * 
 * VSCode-like online code editor component.
 * Can be moved to a separate project by copying this folder.
 */

import CodeOnline from "./components/CodeOnline";

// Export default
export default CodeOnline;

// Panel components
export {
  FileExplorer,
  EditorTabs,
  TerminalPanel,
  StatusBar,
  ActivityBar,
  GitPanel,
  RunPanel,
  MenuBar,
} from "./panel";

// Types
export * from "./types/index";

// Services
export { GitService, getGitService } from "./services";

// Utilities
export { openLocalFolder, readDirectory, reopenLastFolder, getFileExtension } from "./lib/local-file-utils";