# API Routes Documentation

## Overview

The application provides API endpoints for AI chat functionality. All API routes are located in `/app/api/`.

## Chat API

### Endpoint: `/api/chat`

**Method**: POST

**Purpose**: Proxy requests to OpenRouter for AI model chat completions.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <OPENROUTER_API_KEY>
```

**Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    {
      "role": "assistant",
      "content": "I'm doing well, thank you for asking!"
    }
  ],
  "model": "openrouter/auto"
}
```

### Response

**Success** (Streaming):
- Content-Type: `text/event-stream`
- Body: Server-Sent Events with completion chunks

**Error**:
```json
{
  "error": "Error message"
}
```

**Status Codes**:
- `200`: Success (streaming response)
- `400`: Bad Request (invalid body)
- `500`: Internal Server Error

### Implementation Details

The API route:
1. Validates the request body
2. Adds the OpenRouter API key from environment variables
3. Proxies the request to OpenRouter
4. Streams the response back to the client

### Environment Variables

```
OPENROUTER_API_KEY=your_api_key_here
```

## File Upload API (Future)

Planned endpoint for file uploads:

**Endpoint**: `/api/upload`

**Method**: POST

**Purpose**: Handle file uploads for chat attachments.

---

## Error Handling

All API routes follow consistent error handling:

```typescript
try {
  // Process request
} catch (error) {
  console.error("API Error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## Rate Limiting (Future)

Consider implementing rate limiting for production use:
- Per-IP limits
- Per-API-key limits
- Burst protection