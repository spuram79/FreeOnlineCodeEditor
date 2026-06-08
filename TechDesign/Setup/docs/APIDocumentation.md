# API Documentation

## Overview

This document provides detailed API reference for all endpoints in the FreeOnlineCodeEditor application.

**Base URL**: `https://sb-30apv2h137ht.vercel.run`

---

## Table of Contents

1. [Chat API](#chat-api)
2. [MCP API](#mcp-api)
3. [Database API](#database-api)
4. [Error Responses](#error-responses)
5. [Rate Limits](#rate-limits)

---

## Chat API

### Endpoint: `POST /api/chat`

Sends a chat message to AI models via OpenRouter.

#### Request

**Method**: `POST`

**Headers**:
```http
Content-Type: application/json
```

**Body** (JSON):
```typescript
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ],
  "model": "string",
  "apiKey": "string"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | Yes | Array of conversation messages |
| `model` | string | Yes | Model ID to use (e.g., `openrouter/free`) |
| `apiKey` | string | Yes | OpenRouter API key |

#### Response

**Content-Type**: `text/event-stream`

**Status**: `200 OK`

**Response Format**: Server-Sent Events (SSE)

```javascript
data: {"choices":[{"delta":{"content":"Hello"},"index":0,"finish_reason":null}]}

data: {"choices":[{"delta":{"content":" there"},"index":0,"finish_reason":null}]}

...

data: [DONE]
```

#### Example Request

```bash
curl -X POST https://sb-30apv2h137ht.vercel.run/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "model": "openrouter/free",
    "apiKey": "sk-or-xxxxxxxxxxxxx"
  }'
```

#### Streaming Response Parser

```javascript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (!done) {
  const { done, value } = await reader.read();
  const chunk = decoder.decode(value, { stream: true });
  buffer += chunk;
  
  const lines = buffer.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || "";
        // Append to response
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
}
```

---

## MCP API

### Endpoint: `POST /api/mcp`

Model Context Protocol (MCP) server for tool integration.

### 1. Initialize

Initializes the MCP client connection.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {}
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": true
    }
  }
}
```

### 2. Tools/List

Lists all available tools.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "list_chat_models",
        "description": "List all available AI chat models",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      },
      {
        "name": "send_chat_message",
        "description": "Send a message to the AI chat",
        "inputSchema": {
          "type": "object",
          "properties": {
            "messages": {
              "type": "array",
              "items": {"type": "object"}
            },
            "model": {"type": "string"},
            "apiKey": {"type": "string"}
          }
        }
      },
      {
        "name": "get_chat_status",
        "description": "Get current chat status",
        "inputSchema": {
          "type": "object",
          "properties": {}
        }
      }
    ]
  }
}
```

### 3. Tools/Call

Executes a tool.

**Request (send_chat_message)**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "send_chat_message",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Hello"}
      ],
      "model": "openrouter/free",
      "apiKey": "sk-or-xxxxxxxxxxxxx"
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "success": true,
    "response": "AI response text..."
  }
}
```

### Available Tools

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `list_chat_models` | List all available AI models | None |
| `send_chat_message` | Send message to AI | messages[], model, apiKey |
| `get_chat_status` | Get current chat status | None |

---

## Database API

### Endpoint: `POST /api/db/sessions`

Manages chat sessions in the database.

#### Create Session

**Request**:
```json
{
  "action": "create",
  "session": {
    "id": "uuid-string",
    "title": "New Conversation",
    "messages": [],
    "model": "openrouter/free",
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
}
```

#### Update Session

**Request**:
```json
{
  "action": "update",
  "session": {
    "id": "existing-uuid",
    "messages": [...],
    "model": "openrouter/free",
    "title": "Updated Title"
  }
}
```

### Endpoint: `GET /api/db/sessions`

Lists all chat sessions.

**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "title": "Conversation Title",
      "model": "model-id",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

### Endpoint: `DELETE /api/db/sessions?id={sessionId}`

Deletes a single session.

### Endpoint: `DELETE /api/db/sessions/all`

Deletes all sessions.

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid API key |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
| 503 | Service Unavailable - External service down |

---

## Rate Limits

### OpenRouter API Limits

| Tier | Requests/Minute | Notes |
|------|-----------------|-------|
| Free | 20 | Default for free API keys |
| Pro | 100+ | Available with paid plans |

### Application-Level Throttling

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat` | 10 requests | per minute per IP |
| `/api/mcp` | 60 requests | per minute per IP |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// List models
const response = await fetch('/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  })
});

// Send chat message
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }],
    model: 'openrouter/free',
    apiKey: 'sk-or-xxx'
  })
});
```

### Python

```python
import requests

# List models
response = requests.post('https://sb-30apv2h137ht.vercel.run/api/mcp', json={
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
})

# Send message
response = requests.post('https://sb-30apv2h137ht.vercel.run/api/chat', json={
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "openrouter/free",
    "apiKey": "sk-or-xxx"
})
```

---

## Webhook Events (Future)

### Message Status Events

```json
{
  "event": "message.sent",
  "data": {
    "sessionId": "uuid",
    "messageId": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## Documentation Updates

Last updated: June 8, 2026