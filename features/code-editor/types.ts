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