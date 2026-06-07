/**
 * Database Schema - SQLite tables for AI Chat application
 * 
 * Tables:
 * - chat_sessions: Store chat conversation sessions
 * - messages: Store individual messages within sessions
 */

export interface ChatSessionRow {
  id: string;
  title: string;
  model: string;
  focus_mode: string | null;
  created_at: number;
  updated_at: number;
}

export interface MessageRow {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
}

// SQL schema for creating tables
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    model TEXT NOT NULL,
    focus_mode TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
`;