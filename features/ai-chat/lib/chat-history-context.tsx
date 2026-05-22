/**
 * AI Chat Feature - Chat History Context
 * 
 * Manages chat sessions with localStorage persistence.
 * Similar to Claude and Perplexity conversation history.
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, ChatSession } from "../types";

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createNewSession: (model: string) => ChatSession;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSession: (id: string, messages: Message[], model: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  updateTokenUsage: (id: string, promptTokens: number, completionTokens: number, totalTokens: number, toolCallsCount?: number) => void;
  getLastUsage: () => { promptTokens: number; completionTokens: number; totalTokens: number } | null;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

const STORAGE_KEY = "ai_chat_sessions";

// Generate a title from the first user message
function generateTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage) {
    return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
  }
  return "New Conversation";
}

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored sessions:", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = (model: string): ChatSession => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [{ role: "assistant", content: "Hello! I'm a free AI assistant powered by OpenRouter. How can I help you today? 🚀" }],
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
  };

  const selectSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    setCurrentSession(session || null);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  };

  const updateSession = (id: string, messages: Message[], model: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            messages,
            model,
            title: messages.length > 1 ? generateTitle(messages) : s.title,
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    if (currentSession?.id === id) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages,
              model,
              title: messages.length > 1 ? generateTitle(messages) : prev.title,
              updatedAt: Date.now(),
            }
          : null
      );
    }
  };

  const updateSessionTitle = (id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title, updatedAt: Date.now() } : s
      )
    );

    if (currentSession?.id === id) {
      setCurrentSession((prev) =>
        prev ? { ...prev, title, updatedAt: Date.now() } : null
      );
    }
  };

  const updateTokenUsage = (id: string, promptTokens: number, completionTokens: number, totalTokens: number, toolCallsCount: number = 0) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentPrompt = s.totalPromptTokens || 0;
          const currentCompletion = s.totalCompletionTokens || 0;
          const currentTotal = s.totalTokens || 0;
          return {
            ...s,
            totalPromptTokens: currentPrompt + promptTokens,
            totalCompletionTokens: currentCompletion + completionTokens,
            totalTokens: currentTotal + totalTokens,
            toolCallsCount: (s.toolCallsCount || 0) + toolCallsCount,
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    if (currentSession?.id === id) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              totalPromptTokens: (prev.totalPromptTokens || 0) + promptTokens,
              totalCompletionTokens: (prev.totalCompletionTokens || 0) + completionTokens,
              totalTokens: (prev.totalTokens || 0) + totalTokens,
              toolCallsCount: (prev.toolCallsCount || 0) + toolCallsCount,
              updatedAt: Date.now(),
            }
          : null
      );
    }
  };

  const getLastUsage = () => {
    if (!currentSession) return null;
    const lastAssistantMessage = [...currentSession.messages].reverse().find((m) => m.role === "assistant");
    return lastAssistantMessage?.usage || null;
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        sessions,
        currentSession,
        createNewSession,
        selectSession,
        deleteSession,
        updateSession,
        updateSessionTitle,
        updateTokenUsage,
        getLastUsage,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error("useChatHistory must be used within ChatHistoryProvider");
  }
  return context;
}