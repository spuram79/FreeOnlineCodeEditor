/**
 * Authentication Middleware
 * 
 * Simple API key based authentication for protecting API endpoints.
 * Users can use their OpenRouter key directly OR an app-level key.
 */

import { NextRequest, NextResponse } from 'next/server';

const AUTH_HEADER = 'authorization';
const API_KEY_HEADER = 'x-api-key';

/**
 * Validate API key for request authentication
 * Returns true if:
 * - No auth required (public endpoint), OR
 * - Valid API key provided
 */
export function validateAuth(request: NextRequest): { valid: boolean; error?: string } {
  // Skip auth for public endpoints
  const publicPaths = ['/api/chat', '/api/mcp', '/api/db/sessions'];
  const path = request.nextUrl.pathname;
  
  if (publicPaths.some(p => path === p || path.startsWith(p))) {
    // For chat/mcp endpoints, require API key to be present (OpenRouter or app-level)
    const apiKey = request.headers.get(API_KEY_HEADER) || 
                   request.headers.get('x-openrouter-key');
    
    if (!apiKey && !process.env.OPENROUTER_API_KEY) {
      return { valid: false, error: 'API key required. Provide x-api-key header or set OPENROUTER_API_KEY.' };
    }
    return { valid: true };
  }
  
  // For other endpoints, require auth
  const authHeader = request.headers.get(AUTH_HEADER);
  
  if (!authHeader && !process.env.APP_API_KEY) {
    return { valid: true }; // No API key configured, skip auth
  }
  
  if (!authHeader) {
    return { valid: false, error: 'Authorization header required' };
  }
  
  // Support Bearer token and Basic auth
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === process.env.APP_API_KEY) {
      return { valid: true };
    }
  } else if (authHeader.startsWith('Basic ')) {
    // Basic auth: decode base64 and check
    try {
      const decoded = atob(authHeader.slice(6));
      const [username] = decoded.split(':');
      if (username === process.env.APP_API_KEY) {
        return { valid: true };
      }
    } catch {
      // Invalid base64
    }
  }
  
  return { valid: false, error: 'Invalid API key' };
}

/**
 * Higher-order function to add auth check to an API route
 */
export function withAuth(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const auth = validateAuth(request);
    
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }
    
    return handler(request);
  };
}