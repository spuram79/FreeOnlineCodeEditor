/**
 * Rate Limiting Middleware
 * 
 * Simple in-memory rate limiter for API routes.
 * For production at scale, consider using Redis-backed solutions like:
 * - next-rate-limiter
 * - rate-limiter-flexible
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default limits
const DEFAULT_CHAT_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
};

const DEFAULT_API_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
};

function getClientKey(request: NextRequest): string {
  // Use X-Forwarded-For header for real IP behind proxy
  const headers = request.headers;
  const pathname = request.nextUrl?.pathname || 'unknown';
  
  if (!headers) {
    // Fallback for test environments
    return `rate_limit:unknown:${pathname}`;
  }
  
  const forwardedFor = headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return `rate_limit:${ip}:${pathname}`;
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CHAT_LIMIT
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpired();
  
  const key = getClientKey(request);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetTime: entry.resetTime,
  };
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>,
  config: RateLimitConfig = DEFAULT_CHAT_LIMIT
) {
  return async (request: NextRequest) => {
    const rateLimit = checkRateLimit(request, config);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          rateLimit: rateLimit,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(rateLimit.resetTime / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(request);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.max.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.floor(rateLimit.resetTime / 1000).toString());
    
    return response;
  };
}

// Export specific limiters
export const chatRateLimit = DEFAULT_CHAT_LIMIT;
export const apiRateLimit = DEFAULT_API_LIMIT;