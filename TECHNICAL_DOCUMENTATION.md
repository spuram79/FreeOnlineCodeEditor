# FreeOnlineCodeEditor - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Setup Guide](#setup-guide)
5. [Design Documentation](#design-documentation)
6. [Testing Documentation](#testing-documentation)
7. [Deployment](#deployment)
8. [API Reference](#api-reference)

---

## Overview

FreeOnlineCodeEditor is a web-based application providing two main features:
- **AI Chat**: Chat interface with 30+ free AI models via OpenRouter
- **Code Editor**: Multi-language code editor with real-time preview

**Repository**: https://github.com/spuram79/FreeOnlineCodeEditor  
**Live Preview**: https://sb-30apv2h137ht.vercel.run

---

## Architecture

### Project Structure
```
/vercel/sandbox/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Direct chat API endpoint
│   │   └── mcp/route.ts           # MCP (Model Context Protocol) endpoint
│   ├── ai-chat/
│   │   └── page.tsx               # AI Chat UI component
│   ├── editor/
│   │   └── page.tsx               # Code Editor UI component
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── features/
│   ├── ai-chat/
│   │   ├── components/
│   │   │   ├── ChatHistorySidebar.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── SettingsModal.tsx
│   │   ├── lib/
│   │   │   ├── chat-history-context.tsx
│   │   │   └── models.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── code-editor/
│       ├── components/
│       │   ├── CodeEditor.tsx
│       │   └── LanguageDropdown.tsx
│       ├── lib/
│       │   ├── web-templates.ts
│       │   ├── python-template.ts
│       │   ├── csharp-template.ts
│       │   └── java-template.ts
│       ├── types.ts
│       └── index.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

### Technology Stack
- **Framework**: Next.js 16.2.4 (Edge Runtime)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4
- **Code Editor**: Monaco Editor (via @monaco-editor/react)
- **UI Components**: Headless UI, Heroicons
- **Runtime**: Edge Runtime for API routes
- **AI Provider**: OpenRouter API

---

## Features

### 1. AI Chat Feature

#### 1.1. Available Models
The application provides access to 30+ free AI models:

| Model ID | Name | Description |
|----------|------|-------------|
| `openrouter/free` | Free Models Router | Auto-selects the best free model (default) |
| `openrouter/owl-alpha` | Owl Alpha | High-performance model for agentic workloads |
| `meta-llama/llama-3.2-3b-instruct:free` | Llama 3.2 3B Instruct | 3B multilingual instruction model |
| `meta-llama/llama-3.3-70b-instruct:free` | Llama 3.3 70B Instruct | 70B multilingual instruction model |
| `openai/gpt-oss-120b:free` | GPT OSS 120B | Open-weight 117B MoE model from OpenAI |
| `openai/gpt-oss-20b:free` | GPT OSS 20B | Open-weight 21B parameter model |
| `qwen/qwen3-coder:free` | Qwen3 Coder | Mixture-of-Experts code generation model |
| `google/gemma-4-31b-it:free` | Gemma 4 31B | 30.7B dense multimodal model from Google |
| `poolside/laguna-m.1:free` | Poolside Laguna M.1 | Flagship coding agent model |

#### 1.2. Chat History
- **Storage**: localStorage (browser-based)
- **Features**:
  - Persistent conversation history
  - Auto-generated titles from first message
  - Session management (create, delete, select)
  - Timestamps for conversations

#### 1.3. Settings
- API key management via localStorage
- Model selection dropdown
- OpenRouter API key required (get free key at openrouter.ai/keys)

---

### 2. Code Editor Feature

#### 2.1. Supported Languages
- HTML
- CSS
- JavaScript
- Python (via Pyodide)
- C#
- Java

#### 2.2. Editor Features
- **Monaco Editor** with:
  - Dark theme
  - Font ligatures (Fira Code)
  - Word wrap
  - Line numbers
  - Bracket pair colorization
- **Live Preview** for HTML/CSS/JS
- **Python Execution** via Pyodide (in-browser Python runtime)

#### 2.3. Templates
Each language includes default starter templates for quick prototyping.

---

## Setup Guide

### Prerequisites
- Node.js 20.x or higher
- pnpm (recommended) or npm/yarn
- OpenRouter API key (free at openrouter.ai/keys)

### Environment Variables

Create a `.env.local` file:

```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Local Setup

#### Development Environment (Local)

```bash
# Clone repository
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your OpenRouter API key

# Run development server
pnpm run dev

# In browser: http://localhost:3000
```

#### System Integration Testing (SIT)

**Environment**: `.env.sit`
```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://sit.your-domain.com
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=debug
```

**Deployment**:
```bash
# Build for SIT
pnpm run build

# Start production server
pnpm run start
```

#### User Acceptance Testing (UAT)

**Environment**: `.env.uat`
```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://uat.your-domain.com
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=warn
ANALYZE=true
```

**Verification Steps**:
1. Test all 6 language editors with sample code
2. Verify AI chat works with multiple models
3. Check MCP endpoint responses
4. Validate chat history persistence
5. Test responsive design on mobile devices

#### Production Environment

**Environment**: `.env.production`
```env
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

**Deployment Options**:
- Vercel (recommended)
- Docker container
- Any Node.js hosting platform

---

## Design Documentation

### Component Architecture

#### AI Chat Components
```
ChatPageContent (app/ai-chat/page.tsx)
├── SettingsModal.tsx
├── ChatHistorySidebar.tsx
└── MessageBubble.tsx (via chat-history-context)
```

#### Code Editor Components
```
FreeOnlineCodeEditor (app/editor/page.tsx)
├── CodeEditor.tsx
└── LanguageDropdown.tsx
```

### State Management

#### AI Chat State
```typescript
// Chat State
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  selectedModel: string;
  apiKey: string;
  showSettings: boolean;
  showHistory: boolean;
}

// Storage Schema (localStorage)
interface ChatSession {
  id: string;          // UUID
  title: string;       // Auto-generated from messages
  messages: Message[]; // Array of {role, content}
  model: string;       // Model ID
  createdAt: number;   // Unix timestamp
  updatedAt: number; // Unix timestamp
}
```

#### Code Editor State
```typescript
interface CodeState {
  html: string;
  css: string;
  javascript: string;
  python: string;
  csharp: string;
  java: string;
}
```

### API Design

#### Direct Chat API (`/api/chat`)
- **Method**: POST
- **Body**: `{ messages: Message[], model: string, apiKey: string }`
- **Response**: Streaming text/event-stream

#### MCP API (`/api/mcp`)
- **Protocol**: JSON-RPC 2.0
- **Methods**:
  - `initialize` - Server initialization
  - `tools/list` - List available tools
  - `tools/call` - Execute a tool

### UI/UX Design

#### Color Scheme
- **Primary**: Blue (#3B82F6) for user elements
- **Secondary**: Purple (#8B5CF6) for AI elements
- **Dark Mode**: Gray-900 background, Gray-800 cards
- **Light Mode**: Gray-50 background, White cards

#### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Testing Documentation

### Test Files
```
features/
├── ai-chat/
│   ├── lib/models.test.ts
│   └── components/
│       ├── MessageBubble.test.tsx
│       └── SettingsModal.test.tsx
├── code-editor/
│   ├── types.test.ts
│   ├── lib/
│   │   └── templates.test.ts
│   └── components/
│       └── LanguageDropdown.test.tsx
└── api/
    └── chat/
        └── route.test.ts
```

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Cases

#### Chat API Tests (`route.test.ts`)
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Messages validation | Missing/invalid messages array | 400 error |
| Model validation | Missing model parameter | 400 error |
| API key check | No API key provided | 500 error |
| Null values | Null request values | Error response |
| Empty array | Empty messages array | Valid response |

#### Model Tests (`models.test.ts`)
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Model count | Verify all models loaded | 30+ models |
| Default model | Check default model | `openrouter/free` |
| Model structure | Validate model schema | Correct structure |

#### Component Tests
- **LanguageDropdown**: Language selection behavior
- **MessageBubble**: Message rendering
- **SettingsModal**: Settings interactions
- **Templates**: Default code templates

### Test Coverage Goals
- API Routes: 80%+
- Components: 70%+
- Utilities: 90%+

---

## Deployment

### Docker Deployment

#### Build Image
```bash
# Build
docker build -t free-online-code-editor .

# Run
docker run -d -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-xxxxx \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  free-online-code-editor
```

#### Docker Compose
```bash
# Create .env file with your variables
docker-compose up -d
```

### Platform-Specific Deployments

#### Vercel
```bash
vercel --prod
# Set environment variables in Vercel dashboard
```

#### AWS ECS/Fargate
```bash
# Build and push to ECR
docker build -t your-ecr-repo/app .
docker push your-ecr-repo/app

# Create ECS task with port 3000
```

#### Azure Container Apps
```bash
az containerapp create \
  --name free-online-code-editor \
  --image your-registry.azurecr.io/app:latest \
  --environment variables \
  --ingress external
```

#### Google Cloud Run
```bash
gcloud run deploy \
  --image gcr.io/your-project/app \
  --port 3000 \
  --set-env-vars OPENROUTER_API_KEY=xxxxx
```

### Health Check
```bash
# Docker health check endpoint
curl http://localhost:3000/api/mcp
```

---

## API Reference

### MCP Endpoint (`/api/mcp`)

#### GET Request
Returns server capabilities:
```json
{
  "jsonrpc": "2.0",
  "name": "ai-chat-mcp",
  "version": "1.0.0",
  "protocolVersion": "2024-11-05",
  "capabilities": {
    "tools": {
      "list": ["list_chat_models", "send_chat_message", "get_chat_status"],
      "call": true
    }
  }
}
```

#### POST Methods

##### `initialize`
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {}
}
```

##### `tools/list`
Returns all available tools:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "list_chat_models",
        "description": "List all available AI chat models",
        "inputSchema": { "type": "object", "properties": {} }
      },
      {
        "name": "send_chat_message",
        "description": "Send a message to the AI chat",
        "inputSchema": {
          "type": "object",
          "properties": {
            "messages": { "type": "array" },
            "model": { "type": "string" },
            "apiKey": { "type": "string" }
          }
        }
      },
      {
        "name": "get_chat_status",
        "description": "Get AI Chat service status",
        "inputSchema": { "type": "object", "properties": {} }
      }
    ]
  }
}
```

##### `tools/call` - list_chat_models
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_chat_models"
  }
}
```

##### `tools/call` - send_chat_message
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "send_chat_message",
    "arguments": {
      "messages": [{"role": "user", "content": "Hello!"}],
      "model": "openrouter/free",
      "apiKey": "sk-or-xxxxx"
    }
  }
}
```

##### `tools/call` - get_chat_status
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_chat_status"
  }
}
```

### Direct Chat API (`/api/chat`)

#### GET
Returns list of available models:
```json
{
  "models": [
    {
      "id": "openrouter/free",
      "name": "Free Models Router",
      "description": "Auto-selects the best free model"
    }
  ]
}
```

#### POST
Request body:
```json
{
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "model": "openrouter/free",
  "apiKey": "sk-or-xxxxx"
}
```

Response: `text/event-stream` (Server-Sent Events)

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API key error | Add valid OpenRouter API key in settings |
| Python not loading | Wait for Pyodide to initialize, check browser console |
| Chat not responding | Check network connection and API key validity |
| Build errors | Run `pnpm install` to update dependencies |

### Logs
```bash
# View logs
docker logs <container-id>

# Development logs
pnpm run dev --verbose
```

---

## License
MIT License - Santosh Puram