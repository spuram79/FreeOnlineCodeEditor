/**
 * AI Chat Feature - Types
 * 
 * This file contains all TypeScript types for the AI Chat functionality.
 * Can be moved to a separate project by copying this file.
 */

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Model = {
  id: string;
  name: string;
  description: string;
};