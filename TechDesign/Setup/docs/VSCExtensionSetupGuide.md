# VS Code Extension Setup Guide

## Overview

This document provides step-by-step instructions for setting up the Free AI Chat VS Code Extension in different environments: **Local Development**, **SIT (System Integration Testing)**, **UAT (User Acceptance Testing)**, and **Production**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [System Integration Testing (SIT) Setup](#sit-setup)
4. [User Acceptance Testing (UAT) Setup](#uat-setup)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| VS Code | 1.90.0+ | Required for extension compatibility |
| Node.js | 20.x or higher | For building from source |
| npm | 10.x+ | Package manager |

### Account Requirements

| Service | Purpose | URL |
|---------|---------|-----|
| OpenRouter | AI Models API | [openrouter.ai/keys](https://openrouter.ai/keys) |
| GitHub | Source Code Repository | [github.com/spuram79/FreeOnlineCodeEditor](https://github.com/spuram79/FreeOnlineCodeEditor) |

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor
```

### Step 2: Navigate to Extension Directory

```bash
cd vscode-extension
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Compile Extension

```bash
npm run compile
```

### Step 5: Package Extension (Optional)

The extension is already compiled. To create a VSIX file for manual installation:

```bash
# If you want to package your own VSIX
npx @vscode/vsce package --allow-star-activation --allow-missing-repository

# This creates: free-ai-chat-1.0.0.vsix
```

### Step 6: Install Extension Locally

```bash
# Method 1: Install from VSIX file
code --install-extension free-ai-chat-1.0.0.vsix

# Method 2: Run in development mode (for testing)
code --extensionDevelopmentPath=.
```

### Step 6: Configure API Key

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Free AI Chat"
3. Enter your OpenRouter API key in `free-ai-chat.apiKey`

**Alternatively**, create a launch configuration:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionhost",
      "request": "launch",
      "extensionDevelopmentPath": "${workspaceFolder}",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
    }
  ]
}
```

### Local Development Features

| Feature | How to Access |
|---------|---------------|
| Open Chat Panel | `Ctrl+Shift+A` or Activity Bar icon |
| Ask About Selection | Select text + Right-click + "Ask About Selection" |
| Explain Code | Select code + `Ctrl+Shift+E` |
| Generate Code | `Ctrl+Shift+G` |
| Refactor Code | Select code + `Ctrl+Shift+R` |

---

## SIT (System Integration Testing) Setup

### Environment: SIT

**Note**: For SIT, you may want to use a separate API key or configure a specific endpoint.

### Deployment Steps

#### Option 1: Local Installation (SIT)

```bash
# Clone SIT branch if available
git clone -b sit https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor/vscode-extension

# Install dependencies
npm install

# Compile
npm run compile

# Install in VS Code
code --install-extension free-ai-chat-1.0.0.vsix
```

#### Option 2: Build and Test

```bash
# Clean build
rm -rf out
npm run compile

# Run tests
npm run test

# Lint code
npm run lint
```

### SIT Configuration

Update VS Code settings for SIT:

```json
{
  "free-ai-chat.apiKey": "sk-or-sit-api-key",
  "free-ai-chat.endpoint": "https://sit-endpoint.your-domain.com",
  "free-ai-chat.defaultModel": "openrouter/free",
  "free-ai-chat.temperature": 0.7,
  "free-ai-chat.maxTokens": 2048
}
```

### SIT Verification Checklist

- [ ] Extension loads without errors
- [ ] API key is accepted
- [ ] Chat panel opens correctly
- [ ] AI responses are received
- [ ] Code selection commands work
- [ ] Model list loads correctly
- [ ] configuration persists across sessions

---

## UAT (User Acceptance Testing) Setup

### Environment: UAT

**File**: N/A (VS Code extension uses VS Code's built-in configuration system)

### Deployment Steps

```bash
# Package the extension
vsce package

# Output: free-ai-chat-1.0.0.vsix

# Install in VS Code
code --install-extension free-ai-chat-1.0.0.vsix
```

### UAT Configuration

**Important**: Configure for production use:

| Setting | Recommended Value |
|---------|-------------------|
| `free-ai-chat.apiKey` | Production OpenRouter API key |
| `free-ai-chat.endpoint` | `https://sb-30apv2h137ht.vercel.run` |
| `free-ai-chat.defaultModel` | `openrouter/free` |
| `free-ai-chat.temperature` | `0.7` |
| `free-ai-chat.maxTokens` | `2048` |

### UAT Verification Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| Extension installs successfully | No errors in output |
| Chat panel opens | Webview displays correctly |
| AI responds to messages | Response within 10 seconds |
| Code selection works | Selected text appears in chat |
| Settings persist | API key remains after restart |
| All commands available | Command palette shows all options |
| Dark/Light theme works | UI adapts to VS Code theme |
| Copy/Insert functionality | Content copies to clipboard |

### User Acceptance Criteria

1. **Performance**: Chat response < 10 seconds
2. **Reliability**: No extension crashes during use
3. **Usability**: Commands discoverable via Command Palette
4. **Compatibility**: Works with VS Code themes

---

## Production Deployment

### Environment: Production

### Prerequisites

- [VSCE (VS Code Extension Manager)](https://code.visualstudio.com/api/working-with-extensions/package-and-publish) installed:

```bash
npm install -g @vscode/vsce
```

### Publishing Steps

#### 1. Create Publisher (One-time Setup)

```bash
vsce create-publisher spuram79
```

#### 2. Update Extension Metadata

Review and update `package.json`:

```json
{
  "name": "free-ai-chat",
  "displayName": "Free AI Chat",
  "description": "AI Chat assistant powered by OpenRouter - integrated into VS Code",
  "version": "1.0.0",
  "publisher": "spuram79"
}
```

#### 3. Package Extension

```bash
# Package with no marketplace
vsce package --noPay

# Package for marketplace (requires publisher setup)
vsce package
```

#### 4. Publish to VS Code Marketplace

```bash
vsce publish
```

### Manual Installation (Production)

For users who prefer manual installation:

```bash
# Download from VS Code Marketplace
# Or install from VSIX file
code --install-extension free-ai-chat-1.0.0.vsix
```

### Production Configuration

Final production settings:

```json
{
  "free-ai-chat.apiKey": "<USER_API_KEY>",
  "free-ai-chat.defaultModel": "openrouter/free",
  "free-ai-chat.endpoint": "https://sb-30apv2h137ht.vercel.run",
  "free-ai-chat.temperature": 0.7,
  "free-ai-chat.maxTokens": 2048
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "API key not set" error | Ensure `free-ai-chat.apiKey` is set in VS Code settings |
| "No response from AI" | Check internet connection and endpoint URL |
| Extension not loading | Check VS Code Developer Tools console |
| Model list empty | Verify API key has model access |
| Webview not displaying | Run "Developer: Reload Window" |

### Debug Mode

1. Open VS Code Developer Tools:
   - `Help` → `Toggle Developer Tools`
   - Or `Ctrl+Shift+I`

2. Check Console for errors

3. Reload the window:
   - `View` → `Command Palette` → "Developer: Reload Window"

### Logs

```bash
# Run with debug logging
code --log debug

# Check extension logs in Developer Tools
```

### VS Code Developer Tools

```bash
# Open Extension Development Host logs
# View → Output → Extension Host

# Check for extension-specific errors
# Help → Toggle Developer Tools → Console
```

### Reset Extension State

```bash
# Clear extension storage (if needed)
rm -rf ~/.config/Code/User/workspaceStorage/*/free-ai-chat*
```

---

## Architecture Reference

### Extension Structure

```
vscode-extension/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── openrouter-client.ts   # API client layer
│   ├── chat-provider.ts       # Chat functionality
│   └── webview-content.ts     # Webview HTML/CSS/JS
├── media/
│   ├── icon.svg               # Extension icon
│   └── style.css              # Webview styling
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Build configuration
└── README.md                 # Extension documentation
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VS Code Editor                            │
├─────────────────────────────────────────────────────────────┤
│  extension.ts (Entry Point)                                 │
│       │                                                     │
│       ├─> ChatProvider (Webview Controller)               │
│       │       │                                            │
│       │       ├─> openChatPanel()                          │
│       │       ├─> askAboutSelection()                      │
│       │       ├─> explainCode()                            │
│       │       ├─> generateCode()                           │
│       │       └─> refactorCode()                            │
│       │                                                      │
│       └─> OpenRouterClient (API Client)                    │
│               │                                            │
│               ├─> sendChatMessage()                        │
│               ├─> listModels()                             │
│               └─> getStatus()                              │
├─────────────────────────────────────────────────────────────┤
│      MCP API Endpoint (/api/mcp)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Support

- **GitHub Repository**: https://github.com/spuram79/FreeOnlineCodeEditor
- **VS Code Extension Docs**: https://code.visualstudio.com/api
- **OpenRouter API Docs**: https://openrouter.ai/docs

---

*Last Updated: June 8, 2026*