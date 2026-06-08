/**
 * Logging Utility
 * 
 * Structured logging with different levels and context support.
 * For production, consider integrating with:
 * - Vercel Analytics
 * - LogRocket
 * - Sentry
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel;

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[LOG_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export const logger = {
  error(message: string, context?: LogContext): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, context));
    }
  },

  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug') && IS_DEVELOPMENT) {
      console.log(formatMessage('debug', message, context));
    }
  },
};

// Request logging middleware
export function logRequest(request: NextRequest): LogContext {
  const context: LogContext = {
    path: request.nextUrl.pathname,
    method: request.method,
    requestId: crypto.randomUUID(),
  };
  logger.info('Request received', context);
  return context;
}

export function logResponse(context: LogContext, status: number, duration: number): void {
  logger.info('Response sent', {
    ...context,
    status,
    duration: `${duration}ms`,
  });
}