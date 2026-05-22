/**
 * Code Editor Feature - Types
 * 
 * This file contains all TypeScript types for the Code Editor functionality.
 * Can be moved to a separate project by copying this file.
 */

export type Language = "html" | "css" | "javascript" | "python" | "csharp" | "java";

export type CodeState = {
  html: string;
  css: string;
  javascript: string;
  python: string;
  csharp: string;
  java: string;
};

export interface LanguageOption {
  id: Language;
  name: string;
  icon: string;
}

/**
 * Python Cell Types for Google Colab-like interface
 */
export interface PythonCell {
  id: string;
  code: string;
  output: string;
  isRunning: boolean;
  order: number;
}

export interface PythonCellState {
  cells: PythonCell[];
  pyodideReady: boolean;
  isLoading: boolean;
}