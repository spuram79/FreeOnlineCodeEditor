/**
 * AI Chat Feature - Index
 * 
 * Export all components, types, and utilities from the AI Chat feature.
 * This allows importing everything from a single location.
 */

// Components
export { default as SettingsModal } from "./components/SettingsModal";
export { default as MessageBubble } from "./components/MessageBubble";
export { default as ChatHistorySidebar } from "./components/ChatHistorySidebar";

// Types
export type { Message, Model, ChatSession } from "./types";

// Lib
export { FREE_MODELS, DEFAULT_MODEL } from "./lib/models";
export { ChatHistoryProvider, useChatHistory } from "./lib/chat-history-context";