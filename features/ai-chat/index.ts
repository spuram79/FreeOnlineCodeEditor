/**
 * AI Chat Feature - Index
 * 
 * Export all components, types, and utilities from the AI Chat feature.
 * This allows importing everything from a single location.
 */

// Components
export { default as SettingsModal } from "./components/SettingsModal";
export { default as MessageBubble } from "./components/MessageBubble";

// Types
export type { Message, Model } from "./types";

// Lib
export { FREE_MODELS, DEFAULT_MODEL } from "./lib/models";