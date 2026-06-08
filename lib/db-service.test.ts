/**
 * Database Service Tests - Tests for SQLite persistence
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import Database from 'better-sqlite3';
import { SCHEMA } from './db-schema';

// Shared database instance for tests
let testDb: Database.Database;

// Helper functions that use the test database
function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.exec(SCHEMA);
  return db;
}

function withTestDb<T>(fn: (db: Database.Database) => T): T {
  const db = testDb || createTestDb();
  testDb = db;
  return fn(db);
}

describe('Database Service', () => {
  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
      testDb = null!;
    }
  });

  describe('Chat Session operations', () => {
    describe('createChatSession', () => {
      it('should create a new chat session', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare(`
            INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run('test-session-1', 'Test Session', 'openrouter/free', null, now, now);

          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('test-session-1');
          expect(result).toBeDefined();
          expect(result.title).toBe('Test Session');
          expect(result.model).toBe('openrouter/free');
        });
      });

      it('should create a chat session with focus mode', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare(`
            INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run('test-session-2', 'Coding Session', 'openrouter/auto', 'coding', now, now);

          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('test-session-2');
          expect(result.focus_mode).toBe('coding');
        });
      });
    });

    describe('getAllChatSessions', () => {
      it('should return empty array when no sessions exist', () => {
        withTestDb((db) => {
          const result = db.prepare('SELECT * FROM chat_sessions').all();
          expect(result).toEqual([]);
        });
      });

      it('should return all chat sessions', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('session-1', 'Session 1', 'openrouter/free', null, now, now);
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('session-2', 'Session 2', 'openrouter/free', null, now, now);

          const result = db.prepare('SELECT * FROM chat_sessions ORDER BY updated_at DESC').all();
          expect(result).toHaveLength(2);
          const ids = result.map((s: any) => s.id);
          expect(ids).toContain('session-1');
          expect(ids).toContain('session-2');
        });
      });
    });

    describe('getChatSession', () => {
      it('should return null for non-existent session', () => {
        withTestDb((db) => {
          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('non-existent');
          expect(result).toBeUndefined();
        });
      });

      it('should return session with messages', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('session-with-msgs', 'Session with Messages', 'openrouter/free', null, now, now);
          db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('session-with-msgs', 'user', 'Hello', now);
          db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('session-with-msgs', 'assistant', 'Hi there!', now + 1);

          const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('session-with-msgs');
          const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all('session-with-msgs');

          expect(session).toBeDefined();
          expect(messages).toHaveLength(2);
          expect(messages[0].content).toBe('Hello');
          expect(messages[1].content).toBe('Hi there!');
        });
      });
    });

    describe('updateChatSession', () => {
      it('should update session title', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('update-test', 'Original Title', 'openrouter/free', null, now, now);

          db.prepare('UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?').run('Updated Title', now, 'update-test');

          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('update-test');
          expect(result.title).toBe('Updated Title');
        });
      });

      it('should update session focus mode', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('focus-test', 'Focus Test', 'openrouter/free', null, now, now);

          db.prepare('UPDATE chat_sessions SET focus_mode = ?, updated_at = ? WHERE id = ?').run('academic', now, 'focus-test');

          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('focus-test');
          expect(result.focus_mode).toBe('academic');
        });
      });

      it('should update messages', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('msgs-test', 'Messages Test', 'openrouter/free', null, now, now);

          // Delete existing messages
          db.prepare('DELETE FROM messages WHERE session_id = ?').run('msgs-test');

          // Insert new messages
          db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('msgs-test', 'user', 'Question', now);
          db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('msgs-test', 'assistant', 'Answer', now + 1);

          const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all('msgs-test');
          expect(messages).toHaveLength(2);
        });
      });
    });

    describe('deleteChatSession', () => {
      it('should delete a chat session', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('delete-test', 'To Delete', 'openrouter/free', null, now, now);

          db.prepare('DELETE FROM chat_sessions WHERE id = ?').run('delete-test');

          const result = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get('delete-test');
          expect(result).toBeUndefined();
        });
      });

      it('should cascade delete messages', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('cascade-test', 'Cascade Test', 'openrouter/free', null, now, now);
          db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('cascade-test', 'user', 'Hello', now);

          // Delete session (cascade should delete messages)
          db.prepare('DELETE FROM chat_sessions WHERE id = ?').run('cascade-test');

          const messages = db.prepare('SELECT * FROM messages WHERE session_id = ?').all('cascade-test');
          expect(messages).toHaveLength(0);
        });
      });
    });
  });

  describe('Message operations', () => {
    describe('addMessage', () => {
      it('should add a message to a session', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('add-msg-test', 'Add Message Test', 'openrouter/free', null, now, now);

          const messageId = db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('add-msg-test', 'user', 'Test message', now).lastInsertRowid;

          const result = db.prepare('SELECT * FROM messages WHERE session_id = ?').all('add-msg-test');
          expect(result).toHaveLength(1);
          expect(result[0].content).toBe('Test message');
        });
      });
    });

    describe('deleteMessage', () => {
      it('should delete a message by ID', () => {
        withTestDb((db) => {
          const now = Date.now();
          db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('del-msg-test', 'Delete Message Test', 'openrouter/free', null, now, now);

          const messageId = db.prepare('INSERT INTO messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)').run('del-msg-test', 'user', 'Message to delete', now).lastInsertRowid;

          db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);

          const result = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('clearAllData', () => {
    it('should clear all sessions and messages', () => {
      withTestDb((db) => {
        const now = Date.now();
        db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('clear-test-1', 'Test 1', 'openrouter/free', null, now, now);
        db.prepare('INSERT INTO chat_sessions (id, title, model, focus_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run('clear-test-2', 'Test 2', 'openrouter/free', null, now, now);

        db.prepare('DELETE FROM messages').run();
        db.prepare('DELETE FROM chat_sessions').run();

        const sessions = db.prepare('SELECT * FROM chat_sessions').all();
        const messages = db.prepare('SELECT * FROM messages').all();

        expect(sessions).toHaveLength(0);
        expect(messages).toHaveLength(0);
      });
    });
  });
});