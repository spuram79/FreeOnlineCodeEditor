/**
 * Database Service Tests - Tests for SQLite persistence
 */

import Database from 'better-sqlite3';
import * as dbService from './db-service';
import { SCHEMA } from './db-schema';
import { Message, FocusMode } from '../features/ai-chat/types';

// Shared database for in-memory testing
let testDb: Database.Database | null = null;

describe('Database Service', () => {
  beforeEach(() => {
    // Create a fresh in-memory database for each test
    testDb = new Database(':memory:');
    testDb.exec(SCHEMA);
    
    // Share the database with the service module
    dbService.setTestDatabase(testDb);
  });

  afterEach(() => {
    if (testDb) {
      testDb.close();
      testDb = null;
    }
  });

  // Helper to execute queries on the test database
  const execQuery = (query: string, params: any[] = []) => {
    return testDb!.prepare(query).get(...params);
  };

  const execAll = (query: string, params: any[] = []) => {
    return testDb!.prepare(query).all(...params);
  };

  describe('Chat Session operations', () => {
    describe('createChatSession', () => {
      it('should create a new chat session', () => {
        const session = {
          id: 'test-session-1',
          title: 'Test Session',
          model: 'openrouter/free',
          focusMode: undefined,
        };

        const result = dbService.createChatSession(session);

        expect(result.id).toBe('test-session-1');
        expect(result.title).toBe('Test Session');
        expect(result.model).toBe('openrouter/free');

        // Verify in database - using the shared database
        const dbSession = execQuery('SELECT * FROM chat_sessions WHERE id = ?', ['test-session-1']);
        expect(dbSession).toBeDefined();
        expect(dbSession!.title).toBe('Test Session');
      });

      it('should create a chat session with focus mode', () => {
        const session = {
          id: 'test-session-2',
          title: 'Coding Session',
          model: 'openrouter/auto',
          focusMode: 'coding' as FocusMode,
        };

        const result = dbService.createChatSession(session);

        expect(result.focusMode).toBe('coding');

        // Verify in database
        const dbSession = execQuery('SELECT * FROM chat_sessions WHERE id = ?', ['test-session-2']);
        expect(dbSession!.focus_mode).toBe('coding');
      });
    });

    describe('getAllChatSessions', () => {
      it('should return empty array when no sessions exist', () => {
        const result = dbService.getAllChatSessions();
        expect(result).toEqual([]);
      });

      it('should return all chat sessions', () => {
        dbService.createChatSession({
          id: 'session-1',
          title: 'Session 1',
          model: 'openrouter/free',
        });
        
        dbService.createChatSession({
          id: 'session-2',
          title: 'Session 2',
          model: 'openrouter/free',
        });

        const result = dbService.getAllChatSessions();
        
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('session-1');
        expect(result[1].id).toBe('session-2');
      });
    });

    describe('getChatSession', () => {
      it('should return null for non-existent session', () => {
        const result = dbService.getChatSession('non-existent');
        expect(result).toBeNull();
      });

      it('should return session with messages', () => {
        const session = {
          id: 'session-with-msgs',
          title: 'Session with Messages',
          model: 'openrouter/free',
        };
        dbService.createChatSession(session);
        
        const messages: Message[] = [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ];
        
        dbService.updateChatSession('session-with-msgs', { messages });

        const result = dbService.getChatSession('session-with-msgs');
        
        expect(result).not.toBeNull();
        expect(result!.messages).toHaveLength(2);
        expect(result!.messages[0].content).toBe('Hello');
        expect(result!.messages[1].content).toBe('Hi there!');
      });
    });

    describe('updateChatSession', () => {
      it('should update session title', () => {
        dbService.createChatSession({
          id: 'update-test',
          title: 'Original Title',
          model: 'openrouter/free',
        });

        dbService.updateChatSession('update-test', { title: 'Updated Title' });

        const result = dbService.getChatSession('update-test');
        expect(result!.title).toBe('Updated Title');
      });

      it('should update session focus mode', () => {
        dbService.createChatSession({
          id: 'focus-test',
          title: 'Focus Test',
          model: 'openrouter/free',
        });

        dbService.updateChatSession('focus-test', { focusMode: 'academic' as FocusMode });

        const result = dbService.getChatSession('focus-test');
        expect(result!.focusMode).toBe('academic');
      });

      it('should update messages', () => {
        dbService.createChatSession({
          id: 'msgs-test',
          title: 'Messages Test',
          model: 'openrouter/free',
        });

        const messages: Message[] = [
          { role: 'user', content: 'Question' },
          { role: 'assistant', content: 'Answer' },
        ];
        
        dbService.updateChatSession('msgs-test', { messages });

        const result = dbService.getChatSession('msgs-test');
        expect(result!.messages).toHaveLength(2);
      });
    });

    describe('deleteChatSession', () => {
      it('should delete a chat session', () => {
        dbService.createChatSession({
          id: 'delete-test',
          title: 'To Delete',
          model: 'openrouter/free',
        });

        dbService.deleteChatSession('delete-test');

        const result = dbService.getChatSession('delete-test');
        expect(result).toBeNull();
      });

      it('should cascade delete messages', () => {
        dbService.createChatSession({
          id: 'cascade-test',
          title: 'Cascade Test',
          model: 'openrouter/free',
        });

        const messages: Message[] = [
          { role: 'user', content: 'Hello' },
        ];
        dbService.updateChatSession('cascade-test', { messages });

        dbService.deleteChatSession('cascade-test');

        const remainingMessages = execAll('SELECT * FROM messages WHERE session_id = ?', ['cascade-test']);
        expect(remainingMessages).toHaveLength(0);
      });
    });
  });

  describe('Message operations', () => {
    describe('addMessage', () => {
      it('should add a message to a session', () => {
        dbService.createChatSession({
          id: 'add-msg-test',
          title: 'Add Message Test',
          model: 'openrouter/free',
        });

        const message: Message = { role: 'user', content: 'Test message' };
        dbService.addMessage('add-msg-test', message);

        const result = execAll('SELECT * FROM messages WHERE session_id = ?', ['add-msg-test']);
        
        expect(result).toHaveLength(1);
        expect(result[0].content).toBe('Test message');
      });
    });

    describe('deleteMessage', () => {
      it('should delete a message by ID', () => {
        dbService.createChatSession({
          id: 'del-msg-test',
          title: 'Delete Message Test',
          model: 'openrouter/free',
        });

        dbService.addMessage('del-msg-test', { role: 'user', content: 'Message to delete' });

        const messages = execAll('SELECT id FROM messages WHERE session_id = ?', ['del-msg-test']);
        expect(messages.length).toBeGreaterThan(0);
        const messageId = messages[0].id;

        dbService.deleteMessage(messageId);

        const result = execQuery('SELECT * FROM messages WHERE id = ?', [messageId]);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('clearAllData', () => {
    it('should clear all sessions and messages', () => {
      dbService.createChatSession({
        id: 'clear-test-1',
        title: 'Test 1',
        model: 'openrouter/free',
      });

      dbService.createChatSession({
        id: 'clear-test-2',
        title: 'Test 2',
        model: 'openrouter/free',
      });

      dbService.clearAllData();

      const sessions = execAll('SELECT * FROM chat_sessions');
      const messages = execAll('SELECT * FROM messages');
      
      expect(sessions).toHaveLength(0);
      expect(messages).toHaveLength(0);
    });
  });
});