/**
 * Database API Tests - Tests for SQLite persistence
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET, POST, DELETE } from './route';
import Database from 'better-sqlite3';
import { setTestDatabase } from '@/lib/db-service';

// Helper to create mock NextRequest
function createMockRequest(method: string, body?: any, searchParams?: Record<string, string>): Request {
  const url = new URL('http://localhost/api/db/sessions');
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    init.body = JSON.stringify(body);
  }
  
  return new Request(url, init);
}

describe('Database API Routes', () => {
  let db: Database.Database;
  
  beforeEach(() => {
    // Create a fresh in-memory database for each test
    db = new Database(':memory:');
    db.exec(`
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
    `);
    
    // Share this database with the route module
    setTestDatabase(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('GET /api/db/sessions', () => {
    it('should return empty array when no sessions exist', async () => {
      // Clear table
      db.prepare('DELETE FROM chat_sessions').run();
      
      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessions).toEqual([]);
    });

    it('should return all chat sessions', async () => {
      // Insert test session
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('test-id-1', 'Test Session', 'openrouter/free', null, Date.now(), Date.now());

      const request = createMockRequest('GET');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessions).toHaveLength(1);
      expect(data.sessions[0].id).toBe('test-id-1');
      expect(data.sessions[0].title).toBe('Test Session');
    });
  });

  describe('POST /api/db/sessions', () => {
    it('should create a new chat session', async () => {
      const session = {
        id: 'new-session-id',
        title: 'New Session',
        model: 'openrouter/free',
        focusMode: undefined,
        messages: [],
      };

      const request = createMockRequest('POST', { action: 'create', session });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify session was created
      const dbSession = db.prepare('SELECT * FROM chat_sessions WHERE id = ?')
        .get('new-session-id');
      expect(dbSession).toBeDefined();
      expect(dbSession.title).toBe('New Session');
    });

    it('should update an existing chat session', async () => {
      // Create initial session
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('update-test-id', 'Original Title', 'openrouter/auto', null, Date.now(), Date.now());

      const session = {
        id: 'update-test-id',
        title: 'Updated Title',
        model: 'openrouter/free',
        focusMode: 'coding',
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      };

      const request = createMockRequest('POST', { action: 'update', session });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify session was updated
      const dbSession = db.prepare('SELECT * FROM chat_sessions WHERE id = ?')
        .get('update-test-id');
      expect(dbSession.title).toBe('Updated Title');
      expect(dbSession.focus_mode).toBe('coding');
      
      // Verify messages were inserted
      const messages = db.prepare('SELECT * FROM messages WHERE session_id = ?')
        .all('update-test-id');
      expect(messages).toHaveLength(2);
    });

    it('should return error for invalid action', async () => {
      const request = createMockRequest('POST', { action: 'invalid' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });
  });

  describe('DELETE /api/db/sessions', () => {
    it('should delete a specific chat session', async () => {
      // Create session to delete
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('delete-test-id', 'To Delete', 'openrouter/free', null, Date.now(), Date.now());

      const request = createMockRequest('DELETE', undefined, { id: 'delete-test-id' });
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBe('delete-test-id');
      
      // Verify session was deleted
      const dbSession = db.prepare('SELECT * FROM chat_sessions WHERE id = ?')
        .get('delete-test-id');
      expect(dbSession).toBeUndefined();
    });

    it('should return error when no session ID provided', async () => {
      const request = createMockRequest('DELETE');
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Session ID required');
    });

    it('should delete all sessions when all parameter is set', async () => {
      // Create multiple sessions
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('session-1', 'Session 1', 'openrouter/free', null, Date.now(), Date.now());
      
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('session-2', 'Session 2', 'openrouter/free', null, Date.now(), Date.now());

      const request = createMockRequest('DELETE', undefined, { all: 'true' });
      const response = await DELETE(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBe('all');
      
      // Verify all sessions were deleted
      const count = db.prepare('SELECT COUNT(*) as count FROM chat_sessions').get();
      expect(count.count).toBe(0);
    });

    it('should cascade delete messages when session is deleted', async () => {
      // Create session with messages
      db.prepare(`
        INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('cascade-test-id', 'With Messages', 'openrouter/free', null, Date.now(), Date.now());
      
      db.prepare(`
        INSERT INTO messages (session_id, role, content, created_at)
        VALUES (?, ?, ?, ?)
      `).run('cascade-test-id', 'user', 'Hello', Date.now());

      const request = createMockRequest('DELETE', undefined, { id: 'cascade-test-id' });
      await DELETE(request);
      
      // Verify messages were also deleted
      const messages = db.prepare('SELECT * FROM messages WHERE session_id = ?')
        .all('cascade-test-id');
      expect(messages).toHaveLength(0);
    });
  });
});