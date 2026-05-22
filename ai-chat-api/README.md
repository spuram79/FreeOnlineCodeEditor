# AI Chat API Microservice

A standalone microservice for OpenRouter AI chat completions. Extracted from [Santosh Puram's AI Tools](https://github.com/spuram79/FreeOnlineCodeEditor) to be used independently by any application.

## Features

- **Streaming Responses**: Real-time streaming chat completions from OpenRouter
- **Free Models**: Pre-configured list of all free OpenRouter models
- **CORS Enabled**: Works from any origin
- **Docker Ready**: Containerized for easy deployment
- **Health Check**: Built-in health monitoring endpoint

## Quick Start

### Using Docker (Recommended)

1. Clone this directory:
```bash
git clone <repo-url> ai-chat-api
cd ai-chat-api
```

2. Copy the environment file and add your OpenRouter API key:
```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

3. Run with Docker Compose:
```bash
docker-compose up -d
```

### Using Node.js Directly

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenRouter API key:
```bash
OPENROUTER_API_KEY=your_key_here
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### GET /models
List all available free models.

```bash
curl http://localhost:3001/models
```

**Response:**
```json
{
  "models": [
    {
      "id": "openrouter/free",
      "name": "Free Models Router",
      "description": "Auto-selects the best free model"
    },
    ...
  ]
}
```

### POST /chat
Send a chat completion request.

**Request Body:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "openrouter/free",
  "apiKey": "optional_client_api_key"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "openrouter/free",
    "apiKey": "your_openrouter_api_key"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello!' }],
    model: 'openrouter/free',
    apiKey: 'your_openrouter_api_key'
  })
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

### GET /health
Health check endpoint.

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "AI Chat API",
  "timestamp": "2026-05-22T04:00:00.000Z"
}
```

## Available Free Models

| Model ID | Name | Description |
|----------|------|-------------|
| `openrouter/free` | Free Models Router | Auto-selects the best free model |
| `openrouter/owl-alpha` | Owl Alpha | High-performance model for agentic workloads |
| `meta-llama/llama-3.2-3b-instruct:free` | Llama 3.2 3B Instruct | 3B multilingual instruction model |
| `meta-llama/llama-3.3-70b-instruct:free` | Llama 3.3 70B Instruct | 70B multilingual instruction model |
| `qwen/qwen3-coder:free` | Qwen3 Coder | Mixture-of-Experts code generation model |
| `poolside/laguna-m.1:free` | Poolside Laguna M.1 | Flagship coding agent model |
| ... | ... | ... |

See full list at `/models` endpoint.

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required |
| `SITE_URL` | Your site URL for OpenRouter analytics | `http://localhost:3000` |
| `PORT` | Port to run the API | `3001` |

## Docker Deployment

Build and run manually:

```bash
# Build
docker build -t ai-chat-api .

# Run
docker run -d \
  -p 3001:3001 \
  -e OPENROUTER_API_KEY=your_key \
  --name ai-chat-api \
  ai-chat-api
```

## Integration Examples

### React Hook

```typescript
import { useState } from 'react';

function useChat(apiUrl = 'http://localhost:3001') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content, apiKey, model = 'openrouter/free') => {
    setLoading(true);
    
    const response = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content }],
        model,
        apiKey
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // Handle streaming chunks...
    }

    setLoading(false);
  };

  return { messages, sendMessage, loading };
}
```

## License

MIT - Part of Santosh Puram's AI Tools