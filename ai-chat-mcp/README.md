# AI Chat MCP Server

A Model Context Protocol (MCP) server that provides access to the AI Chat API microservice, allowing you to use OpenRouter's free AI models from any MCP-compatible client.

## What is MCP?

The Model Context Protocol (MCP) is a standard way for AI assistants to interact with external tools and services. This server exposes the AI Chat API as an MCP service.

## Features

- **Chat with AI models** - Send messages to 30+ free OpenRouter models
- **List available models** - Browse all free models from OpenRouter
- **Health monitoring** - Check if the AI Chat API is running
- **Usage tracking** - See token usage for each response
- **Dual transport modes** - Supports stdio (local) and HTTP/SSE (remote)

## Prerequisites

1. The AI Chat API microservice must be running (see [ai-chat-api](../ai-chat-api/))
2. Node.js 18 or higher
3. An OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))

## Installation

```bash
cd ai-chat-mcp
npm install
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Required (or pass per request) |
| `AI_CHAT_API_URL` | URL of the AI Chat API microservice | `http://localhost:3001` |
| `AI_CHAT_DEFAULT_MODEL` | Default model to use | `openrouter/free` |
| `MCP_PORT` | Port for HTTP mode | `3002` |
| `MCP_TRANSPORT` | Transport mode: `stdio` or `http` | `stdio` |

### Transport Modes

**stdio mode** (default) - For local clients like Claude Desktop:
```bash
OPENROUTER_API_KEY=your_key node index.js
```

**HTTP/SSE mode** - For remote clients like VSCode:
```bash
MCP_TRANSPORT=http OPENROUTER_API_KEY=your_key node index.js
```

## Usage

### Claude Desktop Configuration

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "ai-chat": {
      "command": "node",
      "args": ["/path/to/ai-chat-mcp/index.js"],
      "env": {
        "OPENROUTER_API_KEY": "your_openrouter_api_key_here"
      }
    }
  }
}
```

### VSCode Configuration (Remote Access)

#### Option 1: Using the MCP extension

For VSCode with MCP support, configure the server URL:

```json
{
  "mcp": {
    "servers": {
      "ai-chat": {
        "url": "http://your-server-ip:3002/mcp"
      }
    }
  }
}
```

#### Option 2: Manual HTTP API Access

The HTTP mode provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | GET | SSE connection for MCP protocol |
| `/mcp` | POST | Send MCP messages (requires `Mcp-Session-Id` header) |
| `/health` | GET | Health check endpoint |
| `/tools` | GET | List available tools |

**Example curl request:**
```bash
# First, establish SSE connection to get session ID
curl -N http://localhost:3002/mcp

# Then send MCP messages using the session ID
curl -X POST http://localhost:3002/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: your-session-id" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

#### Option 3: Run via ngrok for public access

```bash
# Start in HTTP mode
MCP_TRANSPORT=http OPENROUTER_API_KEY=your_key node index.js

# Expose via ngrok
ngrok http 3002
```

Then configure VSCode with the ngrok URL.

## Available Tools

### chat

Send a message to an AI model and get a response.

**Parameters:**
- `messages` (required): Array of conversation messages
  - `role`: "user" or "assistant"
  - `content`: Message text
- `model`: Model ID (default: `openrouter/free`)
- `apiKey`: OpenRouter API key (optional if set via env)
- `temperature`: Randomness control (0-2, default: 0.7)
- `max_tokens`: Maximum response tokens

**Example:**
```json
{
  "name": "chat",
  "arguments": {
    "messages": [
      {"role": "user", "content": "What is quantum computing?"}
    ],
    "model": "openrouter/free"
  }
}
```

### list_models

List all available free AI models from OpenRouter.

**Parameters:** None

**Example:**
```json
{
  "name": "list_models",
  "arguments": {}
}
```

### health_check

Check if the AI Chat API microservice is running.

**Parameters:** None

## Available Resources

### models://list

A JSON resource containing all available models.

**Read with:**
```
ReadResource("models://list")
```

## Available Models

See the [AI Chat API documentation](../ai-chat-api/#available-free-models) for the complete list of 30+ free models including:

- OpenRouter Free (auto-selects best model)
- Meta Llama 3.2 3B & 3.3 70B
- Google Gemma 4
- OpenAI GPT OSS 120B & 20B
- Qwen3 Coder
- NVIDIA Nemotron
- Poolside Laguna (coding models)

## Error Handling

The server returns appropriate error messages when:
- The API microservice is not running
- No API key is provided
- Invalid parameters are sent
- The OpenRouter API returns an error

## Development

```bash
# Install dependencies
npm install

# Run in stdio mode (for Claude Desktop)
OPENROUTER_API_KEY=your_key node index.js

# Run in HTTP mode (for VSCode remote)
MCP_TRANSPORT=http OPENROUTER_API_KEY=your_key node index.js

# With Docker
docker build -t ai-chat-mcp .
docker run -p 3002:3002 -e OPENROUTER_API_KEY=your_key -e MCP_TRANSPORT=http ai-chat-mcp
```

## Architecture

### Stdio Mode (Local)
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   MCP Client    │────▶│  MCP Server     │────▶│  AI Chat API    │
│ (Claude Desktop)│     │ (This package)  │     │ (Microservice)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  OpenRouter     │
                        │  (30+ models)   │
                        └─────────────────┘
```

### HTTP/SSE Mode (Remote)
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   VSCode        │────▶│  MCP Server     │────▶│  AI Chat API    │
│ (MCP Client)    │     │ (HTTP/SSE)      │     │ (Microservice)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  OpenRouter     │
                        │  (30+ models)   │
                        └─────────────────┘
```

## License

MIT - Part of Santosh Puram's AI Tools