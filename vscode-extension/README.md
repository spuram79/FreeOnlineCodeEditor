# Free AI Chat - VS Code Extension

## Overview

This VS Code extension integrates the Free AI Chat functionality directly into Visual Studio Code, providing developers with an AI assistant that can help with coding tasks without leaving the editor.

## Features

### 🎯 Core Features

| Feature | Description | Command |
|---------|-------------|---------|
| **Open Chat Panel** | Full chat interface in a side panel | `free-ai-chat.openChat` |
| **Ask About Selection** | Ask AI questions about selected code | `free-ai-chat.askSelection` |
| **Explain Code** | Get detailed explanations of code | `free-ai-chat.explainCode` |
| **Generate Code** | Generate code from natural language | `free-ai-chat.generateCode` |
| **Refactor Code** | Improve and refactor existing code | `free-ai-chat.refactorCode` |
| **Insert Response** | Insert AI responses at cursor position | `free-ai-chat.insertResponse` |

### 📋 Prerequisites

- VS Code version 1.90.0 or higher
- OpenRouter API key (free at [openrouter.ai/keys](https://openrouter.ai/keys))
- Internet connection (for AI API access)

## Installation

### Option 1: Install from VS Code Marketplace (Future)

```bash
# Search for "Free AI Chat" in VS Code Extensions
# Or install via command line when published
code --install-extension spuram79.free-ai-chat
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor/vscode-extension

# Install dependencies
npm install

# Package the extension
npm install -g @vscode/vsce
vsce package

# Install the generated .vsix file
code --install-extension free-ai-chat-1.0.0.vsix
```

### Option 3: Development Installation

```bash
# Clone and install
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor/vscode-extension
npm install

# Run in development mode
code --extensionDevelopmentPath=.
```

## Configuration

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `free-ai-chat.apiKey` | string | `""` | OpenRouter API Key |
| `free-ai-chat.defaultModel` | string | `"openrouter/free"` | Default AI model |
| `free-ai-chat.endpoint` | string | `"https://sb-30apv2h137ht.vercel.run"` | API endpoint URL |
| `free-ai-chat.temperature` | number | `0.7` | AI creativity (0-1) |
| `free-ai-chat.maxTokens` | number | `2048` | Max response tokens |

### Setting Up API Key

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Free AI Chat"
3. Enter your OpenRouter API key
4. Or use `Ctrl+Shift+P` → "Free AI Chat: Set API Key"

## Usage

### 1. Open Chat Panel

- **Menu**: `View` → `Command Palette` → "Free AI Chat: Open Chat Panel"
- **Shortcut**: `Ctrl+Shift+A` (or customize)
- **Activity Bar**: Click the AI Chat icon

### 2. Ask About Selection

1. Select code in the editor
2. Right-click → "Free AI Chat: Ask About Selection"
3. The chat panel opens with your selection included

### 3. Explain Code

1. Select code you want explained
2. Run "Free AI Chat: Explain Code"
3. AI provides detailed explanation

### 4. Generate Code

1. Place cursor where you want code inserted
2. Run "Free AI Chat: Generate Code"
3. Describe what you want in the prompt
4. Click "Insert" to add at cursor position

### 5. Refactor Code

1. Select code to improve
2. Run "Free AI Chat: Refactor Code"
3. AI suggests improvements
4. Apply changes manually or insert new version

## Available AI Models

| Model | Best For |
|-------|----------|
| `openrouter/free` | General purpose |
| `meta-llama/llama-3.2-3b-instruct:free` | Fast responses |
| `google/gemma-4-31b-it:free` | Reasoning tasks |
| `qwen/qwen3-coder:free` | Code generation |
| `poolside/laguna-m.1:free` | Coding assistance |

## Architecture

```
┌─────────────────────────────────┐
│        VS Code Editor            │
├─────────────────────────────────┤
│     Extension (extension.ts)    │
│    ┌───────────────────────┐   │
│    │    ChatProvider       │   │
│    │  - openChatPanel()    │   │
│    │  - askAboutSelection()│   │
│    │  - explainCode()      │   │
│    │  - generateCode()     │   │
│    │  - refactorCode()     │   │
│    └───────────────────────┘   │
├─────────────────────────────────┤
│     OpenRouterClient           │
│    - sendChatMessage()         │
│    - listModels()              │
│    - getStatus()               │
├─────────────────────────────────┤
│      MCP API Endpoint          │
│      /api/mcp (Remote/Local)   │
└─────────────────────────────────┘
```

## Development

### Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── openrouter-client.ts   # API client
│   ├── chat-provider.ts       # Chat functionality
│   └── webview-content.ts     # Webview HTML/CSS
├── media/
│   ├── icon.svg               # Extension icon
│   └── style.css              # Webview styling
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

### Build Commands

```bash
# Compile TypeScript
npm run compile

# Watch mode (development)
npm run watch

# Package extension
vsce package

# Install locally
code --install-extension free-ai-chat-1.0.0.vsix
```

### Testing

```bash
# Run tests
npm run test

# Lint code
npm run lint
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "API key not set" | Set `free-ai-chat.apiKey` in settings |
| "No response from AI" | Check internet connection or endpoint URL |
| "Model not available" | Try different model or check API key validity |
| "Extension not loading" | Check VS Code Developer Tools console |

### Debug Mode

1. Open VS Code Developer Tools: `Help` → `Toggle Developer Tools`
2. Check Console for errors
3. View → Command Palette → "Developer: Reload Window"

### Logs

```bash
# View extension logs
code --log debug  # Then check Developer Tools
```

## Publishing

### Prerequisites

- VSCE (VS Code Extension Manager): `npm install -g @vscode/vsce`
- Personal Access Token from Azure DevOps or GitHub

### Publish to Marketplace

```bash
# Create publisher (one-time)
vsce create-publisher spuram79

# Package and publish
vsce package
vsce publish
```

## API Integration

The extension uses the MCP (Model Context Protocol) API:

### Endpoint: `/api/mcp`

**List Models**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "list_chat_models" }
}
```

**Send Message**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "send_chat_message",
    "arguments": {
      "messages": [{"role": "user", "content": "Hello"}],
      "model": "openrouter/free",
      "apiKey": "sk-or-xxx"
    }
  }
}
```

## Support

- **GitHub Repository**: https://github.com/spuram79/FreeOnlineCodeEditor
- **OpenRouter API**: https://openrouter.ai/docs
- **VS Code Extension Docs**: https://code.visualstudio.com/api

## License

MIT License - see LICENSE file for details.

---

*Last Updated: June 8, 2026*