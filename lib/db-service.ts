/**
 * Database Service - SQLite operations for AI Chat application
 * 
 * Provides CRUD operations for chat sessions and messages.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { ChatSessionRow, MessageRow, SCHEMA } from './db-schema';
import { ChatSession, Message, FocusMode } from '@/features/ai-chat/types';

// Database instances by path (for testing isolation)
const dbInstances = new Map<string, Database.Database>();

// For backwards compatibility with singleton pattern
let defaultDb: Database.Database | null = null;

function getDatabase(dbPath?: string): Database.Database {
  // For in-memory databases, we need to track by a unique key
  const key = dbPath || 'default';
  
  if (dbPath) {
    // For in-memory or specific paths, create/get instance
    if (!dbInstances.has(key)) {
      const db = new Database(dbPath);
      db.exec(SCHEMA);
      dbInstances.set(key, db);
    }
    return dbInstances.get(key)!;
  }
  
  // Default singleton behavior
  if (!defaultDb) {
    const dbFile = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    defaultDb = new Database(dbFile);
    defaultDb.exec(SCHEMA);
  }
  return defaultDb;
}

// For testing: set a shared database instance
export function setTestDatabase(db: Database.Database): void {
  dbInstances.set('default', db);
  defaultDb = db;
}

// Initialize database
export function initDatabase(dbPath?: string): Database.Database {
  return getDatabase(dbPath);
}

// Close database connection
export function closeDatabase(): void {
  // Close all instances
  for (const instance of dbInstances.values()) {
    instance.close();
  }
  dbInstances.clear();
  
  if (defaultDb) {
    defaultDb.close();
    defaultDb = null;
  }
}

// Chat Session operations
export function createChatSession(
  session: Omit<ChatSession, 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number },
  dbPath?: string
): ChatSession {
  const database = getDatabase(dbPath);
  const now = Date.now();
  
  database.prepare(`
    INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    session.id,
    session.title,
    session.model,
    session.focusMode || null,
    session.createdAt || now,
    session.updatedAt || now
  );

  return {
    ...session,
    focusMode: session.focusMode as FocusMode | undefined,
    createdAt: session.createdAt || now,
    updatedAt: session.updatedAt || now,
  };
}

export function getAllChatSessions(dbPath?: string): ChatSession[] {
  const database = getDatabase(dbPath);
  
  const rows = database.prepare(`
    SELECT id, title, model, focus_mode, created_at, updated_at 
    FROM chat_sessions 
    ORDER BY updated_at DESC
  `).all() as ChatSessionRow[];

  return rows.map(row => ({
    id: row.id,
    title: row.title,
    model: row.model,
    messages: [], // Messages loaded separately
    focusMode: (row.focus_mode as FocusMode) || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function getChatSession(sessionId: string, dbPath?: string): ChatSession | null {
  const database = getDatabase(dbPath);
  
  const sessionRow = database.prepare(`
    SELECT id, title, model, focus_mode, created_at, updated_at 
    FROM chat_sessions 
    WHERE id = ?
  `).get(sessionId) as ChatSessionRow | undefined;

  if (!sessionRow) return null;

  const messageRows = database.prepare(`
    SELECT id, session_id, role, content, created_at 
    FROM messages 
    WHERE session_id = ? 
    ORDER BY created_at ASC
  `).all(sessionId) as MessageRow[];

  return {
    id: sessionRow.id,
    title: sessionRow.title,
    model: sessionRow.model,
    messages: messageRows.map(row => ({
      role: row.role as 'user' | 'assistant',
      content: row.content,
    })),
    focusMode: (sessionRow.focus_mode as FocusMode) || undefined,
    createdAt: sessionRow.created_at,
    updatedAt: sessionRow.updated_at,
  };
}

export function updateChatSession(
  sessionId: string,
  updates: Partial<Pick<ChatSession, 'title' | 'model' | 'focusMode' | 'messages'>>,
  dbPath?: string
): void {
  const database = getDatabase(dbPath);
  const now = Date.now();

  // Update session metadata
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.model !== undefined) {
    fields.push('model = ?');
    values.push(updates.model);
  }
  if (updates.focusMode !== undefined) {
    fields.push('focus_mode = ?');
    values.push(updates.focusMode || null);
  }

  if (fields.length > 0) {
    values.push(now, sessionId);
    database.prepare(`
      UPDATE chat_sessions 
      SET ${fields.join(', ')}, updated_at = ? 
      WHERE id = ?
    `).run(...values);
  }

  // Update messages if provided
  if (updates.messages !== undefined) {
    // Delete existing messages
    database.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
    
    // Insert new messages
    if (updates.messages.length > 0) {
      const insertMsg = database.prepare(`
        INSERT INTO messages (session_id, role, content, created_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const insertMany = database.transaction((messages: Message[]) => {
        for (const msg of messages) {
          insertMsg.run(sessionId, msg.role, msg.content, now);
        }
      });
      
      insertMany(updates.messages);
    }
    
    // Update the session timestamp
    database.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
  }
}

export function deleteChatSession(sessionId: string, dbPath?: string): void {
  const database = getDatabase(dbPath);
  
  // Delete cascade will handle messages automatically
  database.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);
}

// Message operations
export function addMessage(
  sessionId: string,
  message: Message,
  dbPath?: string
): MessageRow {
  const database = getDatabase(dbPath);
  const now = Date.now();
  
  const result = database.prepare(`
    INSERT INTO messages (session_id, role, content, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, message.role, message.content, now);

  // Update session timestamp
  database.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);

  return {
    id: result.lastInsertRowid as number,
    session_id: sessionId,
    role: message.role,
    content: message.content,
    created_at: now,
  };
}

export function deleteMessage(messageId: number, dbPath?: string): void {
  const database = getDatabase(dbPath);
  database.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
}

// Clear all data (useful for testing)
export function clearAllData(dbPath?: string): void {
  const database = getDatabase(dbPath);
  database.prepare('DELETE FROM messages').run();
  database.prepare('DELETE FROM chat_sessions').run();
}