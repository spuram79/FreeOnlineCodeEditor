/**
 * Database API - Server-side database service for AI Chat
 * 
 * This module provides a singleton database connection that persists
 * across requests in a server environment.
 */

import Database from 'better-sqlite3';
import { SCHEMA } from './db-schema';

let db: Database.Database | null = null;

/**
 * Get or create the database connection
 * Uses a file-based database for persistence
 */
export function getDb(): Database.Database {
  if (!db) {
    // Use a persistent database file in the project directory
    const dbPath = process.env.DATABASE_PATH || './data/chat-database.db';
    db = new Database(dbPath);
    db.exec(SCHEMA);
  }
  return db;
}

/**
 * Close the database connection (for cleanup)
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}