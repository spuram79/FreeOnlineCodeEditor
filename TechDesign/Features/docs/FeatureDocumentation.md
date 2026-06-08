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

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-08 | Initial documentation |