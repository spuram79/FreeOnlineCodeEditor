/**
 * AI Chat Feature - Chat History Context
 * 
 * Manages chat sessions with dual persistence:
 * 1. localStorage for client-side quick access
 * 2. SQLite via API for server-side persistence
 * 
 * Similar to Claude and Perplexity conversation history.
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Message, ChatSession, FocusMode } from "../types";

interface ChatHistoryContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  createNewSession: (model: string, focusMode?: FocusMode) => Promise<ChatSession>;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => Promise<void>;
  updateSession: (id: string, messages: Message[], model: string) => Promise<void>;
  updateSessionTitle: (id: string, title: string) => void;
  updateSessionFocusMode: (id: string, focusMode: FocusMode | undefined) => void;
  loadSessionsFromDb: () => Promise<void>;
  deleteAllSessions: () => Promise<void>;
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
        // Use setTimeout to avoid setState in effect warning
        setTimeout(() => {
          setSessions(JSON.parse(stored));
        }, 0);
      } catch (e) {
        console.error("Failed to parse stored sessions:", e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const selectSession = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    setCurrentSession(session || null);
  };

  const deleteSession = async (id: string) => {
    // Delete from server database
    try {
      await fetch(`/api/db/sessions?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete from database:', e);
    }
    
    // Delete from localStorage
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  };

  const updateSession = async (id: string, messages: Message[], model: string) => {
    const updatedSession = {
      id,
      title: messages.length > 1 ? generateTitle(messages) : "New Conversation",
      messages,
      model,
      focusMode: currentSession?.focusMode,
    };
    
    // Update server database
    try {
      await fetch('/api/db/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', session: updatedSession }),
      });
    } catch (e) {
      console.error('Failed to update database:', e);
    }
    
    // Update localStorage
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

  const updateSessionFocusMode = (id: string, focusMode: FocusMode | undefined) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, focusMode, updatedAt: Date.now() } : s
      )
    );

    if (currentSession?.id === id) {
      setCurrentSession((prev) =>
        prev ? { ...prev, focusMode, updatedAt: Date.now() } : null
      );
    }
  };

  // Load sessions from database (server-side persistence)
  const loadSessionsFromDb = async () => {
    try {
      const response = await fetch('/api/db/sessions');
      if (response.ok) {
        const data = await response.json();
        if (data.sessions && data.sessions.length > 0) {
          const dbSessions: ChatSession[] = data.sessions.map((s) => ({
            id: s.id,
            title: s.title,
            messages: [],
            model: s.model,
            focusMode: s.focus_mode || undefined,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          }));
          setSessions(dbSessions);
        }
      }
    } catch (e) {
      console.error('Failed to load sessions from database:', e);
    }
  };

  // Delete all sessions from localStorage and database
  const deleteAllSessions = async () => {
    // Delete from server database
    try {
      const response = await fetch('/api/db/sessions/all', { method: 'DELETE' });
      if (!response.ok) {
        console.error('Failed to delete all sessions from database');
      }
    } catch (e) {
      console.error('Failed to delete all sessions from database:', e);
    }
    
    // Clear localStorage
    setSessions([]);
    setCurrentSession(null);
  };

  // Create new session and persist to database
  const createNewSession = async (model: string, focusMode?: FocusMode): Promise<ChatSession> => {
    const focusWelcome = focusMode
      ? "Hello! I'm a free AI assistant powered by OpenRouter. I'm in " + focusMode.charAt(0).toUpperCase() + focusMode.slice(1) + " mode - how can I help you today? 🚀"
      : "Hello! I'm a free AI assistant powered by OpenRouter. How can I help you today? 🚀";
    
    const now = Date.now();
    const sessionId = crypto.randomUUID();
    
    const newSession: ChatSession = {
      id: sessionId,
      title: "New Conversation",
      messages: [{ role: "assistant", content: focusWelcome }],
      model,
      focusMode,
      createdAt: now,
      updatedAt: now,
    };

    // Persist to server database
    try {
      await fetch('/api/db/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', session: newSession }),
      });
    } catch (e) {
      console.error('Failed to create session in database:', e);
    }

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
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
        updateSessionFocusMode,
        loadSessionsFromDb,
        deleteAllSessions,
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