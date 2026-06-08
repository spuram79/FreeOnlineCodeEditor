/**
 * Database Service - Unified database operations for AI Chat application
 * 
 * Supports both SQLite (development) and PostgreSQL (production)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ChatSession, Message, FocusMode } from '@/features/ai-chat/types';
import { logger, logRequest, logResponse } from '@/lib/logger';

// For development: SQLite
import Database from 'better-sqlite3';
import { join } from 'path';
import { SCHEMA } from './db-schema';

// For production: PostgreSQL via Prisma (optional import)
let PrismaClient: typeof import('@prisma/client').PrismaClient | null = null;

function getPrismaClient() {
  if (!PrismaClient && typeof window === 'undefined') {
    try {
      // Dynamically import Prisma only on server
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaClient = require('@prisma/client').PrismaClient;
    } catch {
      // Prisma not available (tests or dev without Prisma)
      return null;
    }
  }
  if (!PrismaClient) return null;
  const globalPrisma = global as unknown as { prisma: InstanceType<typeof PrismaClient> };
  if (!globalPrisma.prisma) {
    globalPrisma.prisma = new PrismaClient();
  }
  return globalPrisma.prisma;
}

// Check if we should use PostgreSQL (production) or SQLite (development)
function shouldUsePostgres(): boolean {
  return !!process.env.DATABASE_URL || process.env.NODE_ENV === 'production';
}

// Create/Update chat session
export async function upsertChatSession(
  session: Omit<ChatSession, 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number }
): Promise<ChatSession> {
  const now = Date.now();
  
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: session.id }
    });
    
    if (existingSession) {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          title: session.title,
          model: session.model,
          focusMode: session.focusMode || null,
          updatedAt: session.updatedAt || now,
          messages: session.messages ? {
            deleteMany: {},
            create: session.messages.map((msg, idx) => ({
              role: msg.role,
              content: msg.content,
              createdAt: now + idx
            }))
          } : undefined
        },
        include: { messages: true }
      });
    } else {
      await prisma.chatSession.create({
        data: {
          id: session.id,
          title: session.title,
          model: session.model,
          focusMode: session.focusMode || null,
          createdAt: session.createdAt || now,
          updatedAt: session.updatedAt || now,
          messages: session.messages ? {
            create: session.messages.map((msg, idx) => ({
              role: msg.role,
              content: msg.content,
              createdAt: now + idx
            }))
          } : undefined
        },
        include: { messages: true }
      });
    }
    
    // Fetch the complete session
    const result = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
    
    return {
      id: result!.id,
      title: result!.title,
      model: result!.model,
      messages: result!.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      focusMode: result!.focusMode as FocusMode | undefined,
      createdAt: result!.createdAt,
      updatedAt: result!.updatedAt,
    };
  } else {
    // SQLite (development)
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    
    const now = session.createdAt || Date.now();
    
    // Check if session exists
    const existing = db.prepare('SELECT id FROM chat_sessions WHERE id = ?').get(session.id);
    
    if (existing) {
      db.prepare(`
        UPDATE chat_sessions 
        SET title = ?, model = ?, focus_mode = ?, updated_at = ?
        WHERE id = ?
      `).run(
        session.title,
        session.model,
        session.focusMode || null,
        now,
        session.id
      );
    } else {
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        session.id,
        session.title,
        session.model,
        session.focusMode || null,
        now,
        now
      );
    }
    
    // Handle messages
    if (session.messages) {
      db.prepare('DELETE FROM messages WHERE session_id = ?').run(session.id);
      
      if (session.messages.length > 0) {
        const insertMsg = db.prepare(`
          INSERT INTO messages (session_id, role, content, created_at)
          VALUES (?, ?, ?, ?)
        `);
        
        const insertMany = db.transaction((messages: Message[]) => {
          for (const msg of messages) {
            insertMsg.run(session.id, msg.role, msg.content, now);
          }
        });
        
        insertMany(session.messages);
      }
    }
    
    return {
      ...session,
      focusMode: session.focusMode as FocusMode | undefined,
      createdAt: now,
      updatedAt: now,
    };
  }
}

// Get all sessions
export async function getAllChatSessions(): Promise<ChatSession[]> {
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    return sessions.map(s => ({
      id: s.id,
      title: s.title,
      model: s.model,
      messages: [],
      focusMode: s.focusMode as FocusMode | undefined,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  } else {
    // SQLite
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    
    const rows = db.prepare(`
      SELECT id, title, model, focus_mode, created_at, updated_at 
      FROM chat_sessions 
      ORDER BY updated_at DESC
    `).all() as Array<{
      id: string;
      title: string;
      model: string;
      focus_mode: string | null;
      created_at: number;
      updated_at: number;
    }>;
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      model: row.model,
      messages: [],
      focusMode: row.focus_mode || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}

// Get a single session with messages
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
    
    if (!session) return null;
    
    return {
      id: session.id,
      title: session.title,
      model: session.model,
      messages: session.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      focusMode: session.focusMode as FocusMode | undefined,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  } else {
    // SQLite
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    
    const sessionRow = db.prepare(`
      SELECT id, title, model, focus_mode, created_at, updated_at 
      FROM chat_sessions 
      WHERE id = ?
    `).get(sessionId) as {
      id: string;
      title: string;
      model: string;
      focus_mode: string | null;
      created_at: number;
      updated_at: number;
    } | undefined;
    
    if (!sessionRow) return null;
    
    const messageRows = db.prepare(`
      SELECT id, session_id, role, content, created_at 
      FROM messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `).all(sessionId) as Array<{
      id: number;
      session_id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      created_at: number;
    }>;
    
    return {
      id: sessionRow.id,
      title: sessionRow.title,
      model: sessionRow.model,
      messages: messageRows.map(row => ({
        role: row.role as 'user' | 'assistant',
        content: row.content,
      })),
      focusMode: sessionRow.focus_mode || undefined,
      createdAt: sessionRow.created_at,
      updatedAt: sessionRow.updated_at,
    };
  }
}

// Delete a session
export async function deleteChatSession(sessionId: string): Promise<void> {
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    await prisma.chatSession.delete({ where: { id: sessionId } });
  } else {
    // SQLite
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);
  }
}

// Update session messages only
export async function updateSessionMessages(
  sessionId: string,
  messages: Message[]
): Promise<void> {
  const now = Date.now();
  
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: now,
        messages: {
          deleteMany: {},
          create: messages.map((msg, idx) => ({
            role: msg.role,
            content: msg.content,
            createdAt: now + idx
          }))
        }
      }
    });
  } else {
    // SQLite
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
    
    if (messages.length > 0) {
      const insertMsg = db.prepare(`
        INSERT INTO messages (session_id, role, content, created_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const insertMany = db.transaction((msgs: Message[]) => {
        for (const msg of msgs) {
          insertMsg.run(sessionId, msg.role, msg.content, now);
        }
      });
      
      insertMany(messages);
    }
    
    db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
  }
}

// Clear all sessions (for testing)
export async function clearAllSessions(): Promise<void> {
  if (shouldUsePostgres()) {
    const prisma = getPrismaClient();
    await prisma.message.deleteMany();
    await prisma.chatSession.deleteMany();
  } else {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
    const db = new Database(dbPath);
    db.exec(SCHEMA);
    db.prepare('DELETE FROM messages').run();
    db.prepare('DELETE FROM chat_sessions').run();
  }
}