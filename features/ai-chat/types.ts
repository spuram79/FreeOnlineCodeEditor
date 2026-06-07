/**
 * AI Chat Feature - Types
 * 
 * This file contains all TypeScript types for the AI Chat functionality.
 * Perplexity-like features: sources, focus mode, follow-up questions
 */

export type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  followUpQuestions?: string[];
};

export type Source = {
  id: string;
  url: string;
  title: string;
  snippet?: string;
};

export type FocusMode = "web" | "academic" | "writing" | "coding" | "math";

export type Model = {
  id: string;
  name: string;
  description: string;
  focusModeSupport?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  focusMode?: FocusMode;
  createdAt: number;
  updatedAt: number;
};