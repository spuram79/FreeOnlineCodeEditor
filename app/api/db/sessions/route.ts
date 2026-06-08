/**
 * Database API Routes - CRUD operations for chat sessions and messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  upsertChatSession, 
  getAllChatSessions, 
  getChatSession,
  deleteChatSession,
  clearAllSessions
} from '@/lib/db-service';
import { ChatSession } from '@/features/ai-chat/types';
import { logger, logRequest, logResponse } from '@/lib/logger';

// GET /api/db/sessions - List all chat sessions
export async function GET(request: NextRequest) {
  const context = logRequest(request);
  const start = Date.now();
  
  try {
    const sessions = await getAllChatSessions();
    logResponse(context, 200, Date.now() - start);
    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    logResponse(context, 500, Date.now() - start);
    logger.error('Failed to get sessions', { 
      ...context, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// POST /api/db/sessions - Create or update a chat session
export async function POST(request: NextRequest) {
  const context = logRequest(request);
  const start = Date.now();
  
  try {
    const body = await request.json();
    const { action, session } = body as { action: string; session: ChatSession };

    if (action === 'create' || action === 'update') {
      const result = await upsertChatSession(session);
      logResponse(context, 200, Date.now() - start);
      return NextResponse.json({ success: true, session: result });
    }

    logResponse(context, 400, Date.now() - start);
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    logResponse(context, 500, Date.now() - start);
    logger.error('Failed to upsert session', { 
      ...context, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE /api/db/sessions - Delete a chat session
export async function DELETE(request: NextRequest) {
  const context = logRequest(request);
  const start = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const deleteAll = searchParams.get('all');

    if (deleteAll === 'true' || sessionId === 'all') {
      await clearAllSessions();
      logResponse(context, 200, Date.now() - start);
      return NextResponse.json({ success: true, deleted: 'all' });
    }
    
    if (!sessionId) {
      logResponse(context, 400, Date.now() - start);
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    await deleteChatSession(sessionId);
    logResponse(context, 200, Date.now() - start);
    return NextResponse.json({ success: true, deleted: sessionId });
  } catch (error: unknown) {
    logResponse(context, 500, Date.now() - start);
    logger.error('Failed to delete session', { 
      ...context, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}