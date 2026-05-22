/**
 * AI Chat Feature - Index
 * 
 * Export all components, types, and utilities from the AI Chat feature.
 * This allows importing everything from a single location.
 */

// Components
export { default as AIAssistant } from "./components/AIAssistant";
export { default as MessageBubble } from "./components/MessageBubble";
export { default as ChatHistorySidebar } from "./components/ChatHistorySidebar";
export { default as SettingsModal } from "./components/SettingsModal";

// Types
export type { Message, Model, ChatSession, Usage, ToolCall } from "./types";

// Context (state management)
export { ChatHistoryProvider, useChatHistory } from "./lib/chat-history-context";

// Models and configuration
export { FREE_MODELS, DEFAULT_MODEL } from "./lib/models";

// Services and API
export { USE_MICROSERVICE, MICROSERVICE_URL, getChatEndpoint, getModelsEndpoint } from "./lib/microservice-config";

// Workspace
export { scanWorkspace } from "./lib/workspace-scanner";