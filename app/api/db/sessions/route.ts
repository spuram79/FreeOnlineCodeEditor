/**
 * Database API Routes - CRUD operations for chat sessions and messages
 */

import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { join } from 'path';
import { SCHEMA } from '@/lib/db-schema';

// Shared database instance for testing
let sharedDb: Database.Database | null = null;

// For testing: set a shared database
export function setTestDatabase(db: Database.Database): void {
  sharedDb = db;
}

// Get database connection
function getDb() {
  if (sharedDb) {
    return sharedDb;
  }
  
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data/chat-database.db');
  const db = new Database(dbPath);
  db.exec(SCHEMA);
  return db;
}

// GET /api/db/sessions - List all chat sessions
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    const sessions = db.prepare(`
      SELECT id, title, model, focus_mode, created_at, updated_at 
      FROM chat_sessions 
      ORDER BY updated_at DESC
    `).all();

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/db/sessions - Create or update a chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, session } = body;

    const db = getDb();

    if (action === 'create') {
      const now = Date.now();
      
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

      return NextResponse.json({ success: true, session });

    } else if (action === 'update') {
      const now = Date.now();
      
      // Update session metadata
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

      // Handle messages
      if (session.messages) {
        db.prepare('DELETE FROM messages WHERE session_id = ?').run(session.id);
        
        if (session.messages.length > 0) {
          const insertMsg = db.prepare(`
            INSERT INTO messages (session_id, role, content, created_at)
            VALUES (?, ?, ?, ?)
          `);
          
          const insertMany = db.transaction((messages: any[]) => {
            for (const msg of messages) {
              insertMsg.run(session.id, msg.role, msg.content, now);
            }
          });
          
          insertMany(session.messages);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/db/sessions - Delete a chat session
// DELETE /api/db/sessions/all - Delete all sessions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const deleteAll = searchParams.get('all');

    const db = getDb();
    
    if (deleteAll === 'true' || sessionId === 'all') {
      // Delete all sessions
      db.prepare('DELETE FROM chat_sessions').run();
      return NextResponse.json({ success: true, deleted: 'all' });
    }
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Delete cascade will handle messages automatically
    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);

    return NextResponse.json({ success: true, deleted: sessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}