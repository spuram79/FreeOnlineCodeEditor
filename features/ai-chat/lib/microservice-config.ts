/**
 * AI Chat Feature - Microservice Configuration
 * 
 * Configuration for using external AI Chat API microservice.
 * Can be used instead of the built-in Next.js API route.
 */

// Microservice configuration - set NEXT_PUBLIC_USE_MICROSERVICE=true to enable
export const USE_MICROSERVICE = process.env.NEXT_PUBLIC_USE_MICROSERVICE === 'true';

// Microservice URL - defaults to localhost:3001
export const MICROSERVICE_URL = process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001';

// Build the chat completion endpoint URL
export function getChatEndpoint(): string {
  return USE_MICROSERVICE 
    ? `${MICROSERVICE_URL}/chat`
    : '/api/chat';
}

// Build the models endpoint URL
export function getModelsEndpoint(): string {
  return USE_MICROSERVICE
    ? `${MICROSERVICE_URL}/models`
    : '/api/chat';
}