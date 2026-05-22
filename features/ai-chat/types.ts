/**
 * AI Chat Feature - Types
 * 
 * This file contains all TypeScript types for the AI Chat functionality.
 * Can be moved to a separate project by copying this file.
 */

export type Usage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  usage?: Usage;
  toolCalls?: ToolCall[];
};

export type Model = {
  id: string;
  name: string;
  description: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
  totalPromptTokens?: number;
  totalCompletionTokens?: number;
  totalTokens?: number;
  toolCallsCount?: number;
};