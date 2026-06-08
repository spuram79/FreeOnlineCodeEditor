# Feature Documentation

## Overview

This document provides detailed documentation for each feature in the FreeOnlineCodeEditor application.

**Table of Contents**
1. [AI Chat Feature](#ai-chat-feature)
2. [Code Editor Feature](#code-editor-feature)
3. [Chat History Feature](#chat-history-feature)
4. [Settings Feature](#settings-feature)
5. [Copy & Download Feature](#copy--download-feature)
6. [MCP Integration](#mcp-integration)
7. [VS Code Extension](#vs-code-extension)
8. [SQLite Database](#sqlite-database)

**Related Documentation:**
- [VS Code Extension Setup Guide](../Setup/docs/VSCExtensionSetupGuide.md) - Installation and configuration for all environments

---

## AI Chat Feature

### Overview
AI Chat provides conversational AI capabilities with access to 30+ free models via OpenRouter.

### Features

| Feature | Description | Location |
|---------|-------------|----------|
| Model Selection | Choose from 30+ free AI models | Header dropdown |
| Streaming Responses | Real-time AI response streaming | Main chat area |
| Markdown Support | Render markdown in responses | MessageBubble |
| Source Citations | Display referenced sources | MessageBubble |
| Follow-up Questions | Suggested related questions | MessageBubble |

### Models Available

| Model Category | Models |
|---------------|--------|
| **General Purpose** | openrouter/free, meta-llama/llama-3.2-3b-instruct:free, google/gemma-4-31b-it:free |
| **Coding** | qwen/qwen3-coder:free, poolside/laguna-m.1:free |
| **Writing** | meta-llama/llama-3.3-70b-instruct:free |
| **Math** | openai/gpt-oss-120b:free |

### User Interface
```
┌─────────────────────────────────────────────────────────┐
│ Santosh Puram's AI Chat                        [History] │
│ Powered by OpenRouter Free Models                       │
├─────────────────────────────────────────────────────────┤
│ 🤖 AI: Hello! How can I help you today?                  │
│                                                         │
│ You: What is React.js?                                  │
│                                                         │
│ 🤖 AI: React.js is a JavaScript library for building... │
│ [Copy] [Download]                                       │
├─────────────────────────────────────────────────────────┤
│ Type your message...                       [Send]       │
└─────────────────────────────────────────────────────────┘
```

---

## Code Editor Feature

### Overview
Multi-language code editor with live preview and Python execution.

### Supported Languages

| Language | Extension | Features |
|----------|-----------|----------|
| HTML | .html | Live preview |
| CSS | .css | Live preview |
| JavaScript | .js | Live preview, execution |
| Python | .py | Pyodide in-browser execution |
| C# | .cs | Template with sample |
| Java | .java | Template with sample |

### Features

| Feature | Description |
|---------|-------------|
| Monaco Editor | VS Code-quality editor |
| Syntax Highlighting | Language-specific highlighting |
| Live Preview | Real-time HTML/CSS/JS output |
| Python Runtime | Execute Python in browser |
| Templates | Starter code for each language |
| Download | Save code to file |

### User Interface
```
┌─────────────────────────────────────────────────────────┐
│ Code Editor                                    [ language] │
├────────────────┬────────────────────────────────────────┤
│ HTML           │ <html>                                │
│ CSS            │   <style>                             │
│ JS             │   </style>                            │
│                │ </html>                               │
│                ├────────────────────────────────────────┤
│ Preview        │ [Live rendered output here]            │
└────────────────┴────────────────────────────────────────┘
```

---

## Chat History Feature

### Overview
Persistent conversation management stored in browser localStorage.

### Features

| Feature | Description |
|---------|-------------|
| Auto-save | Conversations saved automatically |
| Session List | View all conversations |
| Search | Filter conversations by title |
| Export | Download conversations (TXT/MD/JSON) |
| Delete | Remove individual or all conversations |

### Data Schema

```typescript
interface ChatSession {
  id: string;           // UUID
  title: string;        // Auto-generated
  messages: Message[]; // Conversation history
  model: string;        // Model used
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
}
```

### Storage Locations

| Location | Persistence | Access |
|----------|-------------|--------|
| localStorage | Browser-only | Current device |
| SQLite DB | Server | All devices (server-side) |

---

## Settings Feature

### Overview
Configuration management for API keys and preferences.

### Settings Options

| Setting | Type | Description |
|---------|------|-------------|
| OpenRouter API Key | Password | AI model access key |
| Default Model | Select | Pre-selected model |
| Theme | Toggle | Light/Dark mode |

### Access
- Click the gear icon ⚙️ in the header
- Modal opens with settings form

---

## Copy & Download Feature

### Overview
Enhanced export capabilities for chat conversations and responses.

### Features Implemented

| Feature | Location | Description |
|---------|----------|-------------|
| **Whole Conversation Export** | Header → Export button | Download entire conversation as TXT, MD, or JSON |
| **Copy Conversation** | Header → Copy button | Copy entire conversation to clipboard |
| **Individual Response Copy** | AI Message → Copy button | Copy single AI response to clipboard |
| **Individual Response Download** | AI Message → Download button | Download single AI response as TXT or Markdown |

### User Interface

```
Header Actions:
┌─────────────────────────────────────────────────────────┐
│ [Copy] [Export] [History] [Settings]                      │
└─────────────────────────────────────────────────────────┘

Export Modal:
┌─────────────────────────────────────────────────────────┐
│ Export Conversation                                     │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Export as Text (.txt)                                │ │
│ │ Export as Markdown (.md)                             │ │
│ │ Export as JSON (.json)                               │ │
│ │ Cancel                                               │ │
│ └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

AI Message Actions (appears on hover):
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI response content...                               │
│ [Copy] [TXT] [MD]                                       │
└─────────────────────────────────────────────────────────┘
```

### File Formats

| Format | Extension | Content Style |
|--------|-----------|---------------|
| Text | .txt | Plain text, human-readable |
| Markdown | .md | Markdown formatted |
| JSON | .json | Structured data with metadata |

---

## MCP Integration

### Overview
Model Context Protocol (MCP) server for IDE/tool integration.

### Available Tools

| Tool | Method | Description |
|------|--------|-------------|
| `list_chat_models` | POST /api/mcp | List available AI models |
| `send_chat_message` | POST /api/mcp | Send message to AI |
| `get_chat_status` | POST /api/mcp | Get current status |

### Example MCP Client Request

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "send_chat_message",
    "arguments": {
      "messages": [
        {"role": "user", "content": "Hello AI"}
      ],
      "model": "openrouter/free",
      "apiKey": "sk-or-xxx"
    }
  }
}
```

---

## Quick Reference

### File Structure
```
features/
├── ai-chat/
│   ├── components/
│   │   ├── ChatHistorySidebar.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── CodeBlock.tsx
│   │   └── MarkdownRenderer.tsx
│   ├── lib/
│   │   ├── chat-history-context.tsx
│   │   └── models.ts
│   ├── types.ts
│   └── index.ts
```

### Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/ai-chat` | AI Chat interface |
| `/editor` | Code Editor |

### Configuration
| Variable | Required | Environment |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | All |
| `NEXT_PUBLIC_SITE_URL` | Yes | All |

---

## VS Code Extension

### Overview

A VS Code extension that integrates the Free AI Chat functionality directly into the editor, allowing developers to use AI assistance without leaving their coding environment.

### Extension Features

| Feature | Command | Description |
|---------|---------|-------------|
| Open Chat Panel | `free-ai-chat.openChat` | Opens webview chat panel |
| Ask About Selection | `free-ai-chat.askSelection` | Ask AI about selected code |
| Explain Code | `free-ai-chat.explainCode` | Get code explanations |
| Generate Code | `free-ai-chat.generateCode` | Generate code from description |
| Refactor Code | `free-ai-chat.refactorCode` | Improve existing code |
| Insert Response | `free-ai-chat.insertResponse` | Insert AI response at cursor |

### Installation

**See [VS Code Extension Setup Guide](../Setup/docs/VSCExtensionSetupGuide.md) for detailed installation instructions for Local, SIT, UAT, and Production environments.**

```bash
# Quick install from source
cd vscode-extension
npm install
npm run compile
code --extensionDevelopmentPath=.
```

### Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `free-ai-chat.apiKey` | `""` | OpenRouter API Key |
| `free-ai-chat.defaultModel` | `"openrouter/free"` | Default AI model |
| `free-ai-chat.endpoint` | Remote URL | API endpoint URL |
| `free-ai-chat.temperature` | `0.7` | AI creativity level |
| `free-ai-chat.maxTokens` | `2048` | Max response tokens |

### Architecture

```
┌─────────────────────────────────┐
│        VS Code Editor            │
├─────────────────────────────────┤
│     Extension (extension.ts)    │
│    ┌───────────────────────┐   │
│    │    ChatProvider       │   │
│    └───────────────────────┘   │
├─────────────────────────────────┤
│     OpenRouterClient           │
├─────────────────────────────────┤
│      MCP API Endpoint          │
│      /api/mcp (Remote/Local)   │
└─────────────────────────────────┘
```

### Use Cases

1. **Code Explanation**: Select code → Run "Explain Code" → Get detailed explanation
2. **Bug Finding**: Select problematic code → Ask AI to find bugs → Apply fixes
3. **Code Generation**: Describe what you need → Get AI-generated code → Insert at cursor
4. **Refactoring**: Select code → Run "Refactor Code" → Get improved version
5. **Learning**: Ask questions about programming concepts in the chat panel

### Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts          # Main entry point
│   ├── openrouter-client.ts  # API client
│   ├── chat-provider.ts      # Chat functionality
│   └── webview-content.ts    # Webview HTML/CSS
├── media/
│   ├── icon.svg              # Extension icon
│   └── style.css             # Webview styling
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # Extension documentation
```

---

## SQLite Database

### Overview

Server-side persistence using SQLite database for storing chat sessions, allowing data to persist across devices and browser sessions.

### Schema

```sql
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources TEXT,
  follow_up_questions TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session ON messages(session_id);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/db/sessions` | GET | List all sessions |
| `/api/db/sessions` | POST | Create new session |
| `/api/db/sessions/:id` | GET | Get session with messages |
| `/api/db/sessions/:id` | PUT | Update session |
| `/api/db/sessions/:id` | DELETE | Delete session |
| `/api/db/sessions/all` | DELETE | Delete all sessions |

### Features

| Feature | Description |
|---------|-------------|
| Persistent Storage | Sessions survive browser clearing |
| Cross-Device Sync | Access from any device |
| Full CRUD | Create, Read, Update, Delete sessions |
| Bulk Operations | Delete all sessions at once |
| Structured Data | Proper relational schema |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-08 | Initial documentation |