/**
 * Code Editor Feature - Index
 * 
 * Export all components, types, and utilities from the Code Editor feature.
 * This allows importing everything from a single location.
 */

// Components
export { default as CodeEditor } from "./components/CodeEditor";
export { default as LanguageDropdown } from "./components/LanguageDropdown";
export { PythonCellContainer } from "./components/PythonCell";

// Types
export type { Language, CodeState, LanguageOption, PythonCell, PythonCellState } from "./types";
export { LANGUAGES } from "./components/LanguageDropdown";

// Templates (starter code for different languages)
export { defaultHtml, defaultCss, defaultJs } from "./lib/web-templates";
export { defaultPython } from "./lib/python-template";
export { defaultCSharp } from "./lib/csharp-template";
export { defaultJava } from "./lib/java-template";

// Hooks
export { usePythonCells } from "./lib/usePythonCells";