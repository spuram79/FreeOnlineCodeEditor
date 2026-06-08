# Design Documentation

## Overview

This document describes the architectural design, component hierarchy, and user interface patterns of the FreeOnlineCodeEditor application.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [UI/UX Design](#uiux-design)
4. [State Management](#state-management)
5. [API Design](#api-design)
6. [Data Flow](#data-flow)
7. [Security Considerations](#security-considerations)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                             │
├─────────────────────────────────────────────────────────────────┤
│                        Next.js Application                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   AI Chat   │    │ Code Editor │    │     Pages           │  │
│  │   Feature   │    │   Feature   │    │  (app routing)      │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes Layer                        │  │
│  │  /api/chat      - AI streaming endpoint                    │  │
│  │  /api/mcp       - Model Context Protocol server           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  External Services                       │  │
│  │  OpenRouter API    - AI model provider                   │  │
│  │  SQLite (optional)- Server-side persistence               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### AI Chat Feature Components

```
app/ai-chat/page.tsx (ChatPageContent)
├── SettingsModal.tsx
│   └── API key management, model selection
├── ChatHistorySidebar.tsx
│   └── Conversation list, export, delete
└── MessageBubble.tsx (per message)
    ├── MarkdownRenderer.tsx
    ├── CodeBlock.tsx
    └── SourceLink.tsx
```

### Component Details

#### 1. ChatPageContent (`app/ai-chat/page.tsx`)
- **Purpose**: Main container for AI chat interface
- **Responsibilities**:
  - State management for messages, loading, settings
  - API communication with OpenRouter
  - Session management via context
- **Props**: None (uses context)

#### 2. SettingsModal (`features/ai-chat/components/SettingsModal.tsx`)
- **Purpose**: Manage API key and model selection
- **Props**:
  ```typescript
  interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
  }
  ```

#### 3. ChatHistorySidebar (`features/ai-chat/components/ChatHistorySidebar.tsx`)
- **Purpose**: Display and manage conversation history
- **Props**:
  ```typescript
  interface ChatHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
  }
  ```
- **Features**:
  - List conversations with dates
  - Delete individual conversations
  - Export conversations (Text/Markdown/JSON)
  - New conversation button

#### 4. MessageBubble (`features/ai-chat/components/MessageBubble.tsx`)
- **Purpose**: Display individual chat messages
- **Props**:
  ```typescript
  interface MessageBubbleProps {
    message: Message;
    onFollowUpClick?: (question: string) => void;
  }
  ```
- **Features**:
  - User/AI message styling
  - Markdown rendering
  - Source citations
  - Follow-up questions
  - Copy/download individual responses

#### 5. MarkdownRenderer (`features/ai-chat/components/MarkdownRenderer.tsx`)
- **Purpose**: Render markdown content with styling
- **Supports**:
  - Headers (H1-H6)
  - Bold/Italic
  - Code blocks (with syntax highlighting)
  - Lists (ordered/unordered)
  - Links
  - Inline code

#### 6. CodeBlock (`features/ai-chat/components/CodeBlock.tsx`)
- **Purpose**: Syntax-highlighted code display
- **Features**:
  - Language detection
  - Copy button
  - Download button
  - Line numbers

---

## UI/UX Design

### Color Scheme

| Element | Light Mode | Dark Mode | Hex Code |
|---------|------------|-----------|----------|
| Primary (User) | Blue-500 | Blue-500 | `#3B82F6` |
| Secondary (AI) | Gradient | Gradient | `#8B5CF6` to `#3B82F6` |
| Background | Gray-50 | Gray-900 | `#F9FAFB` / `#111827` |
| Cards | White | Gray-800 | `#FFFFFF` / `#1F2937` |
| Borders | Gray-200 | Gray-700 | `#E5E7EB` / `#374151` |

### Typography

| Element | Font Size | Weight | Line Height |
|---------|-----------|--------|-------------|
| Header | 24px | 700 | 1.2 |
| Title | 20px | 600 | 1.3 |
| Body | 16px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | Single column, hidden sidebar |
| Tablet | 640px - 1024px | Collapsible sidebar |
| Desktop | > 1024px | Full sidebar visible |

### Key UI Patterns

#### Message Bubble Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ ┌───┐  User Message                                         │
│ │ U │  Background: Blue-500, Text: White                    │
│ └───┘  Rounded: br-md (bottom-right)                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AI Message                                                  │
│ ┌───┐  Background: White/Dark Gray, Border: Gray          │
│ │AI │  Rounded: bl-md (bottom-left)                         │
│ └───┘  Shadow: sm                                          │
│ [Copy] [Download]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management

### AI Chat State Structure

```typescript
// Main state in ChatPageContent
interface ChatState {
  input: string;                    // Current input text
  isLoading: boolean;             // Streaming state
  selectedModel: string;          // Active model ID
  apiKey: string;                 // OpenRouter API key
  showSettings: boolean;          // Settings modal visibility
  showHistory: boolean;           // Sidebar visibility
  selectedFocusMode: FocusMode | undefined;
}
```

### Chat Session Schema (localStorage)

```typescript
interface ChatSession {
  id: string;                    // UUID
  title: string;                 // Auto-generated from first message
  messages: Message[];          // Array of messages
  model: string;                // Model ID used
  focusMode?: FocusMode;        // Coding, Writing, Academic mode
  createdAt: number;            // Unix timestamp
  updatedAt: number;            // Unix timestamp
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  followUpQuestions?: string[];
}

interface Source {
  id: string;
  url: string;
  title: string;
  snippet?: string;
}
```

---

## API Design

### 1. Chat API (`/api/chat`)

**Endpoint**: `POST /api/chat`

**Request Body**:
```typescript
{
  messages: Message[],     // Array of conversation messages
  model: string,           // Model ID to use
  apiKey: string           // OpenRouter API key
}
```

**Response**: Stream of `text/event-stream`

**Event Format**:
```
data: {"choices":[{"delta":{"content":"response text"}}]}
...
data: [DONE]
```

### 2. MCP API (`/api/mcr`)

**Protocol**: JSON-RPC 2.0

**Available Tools**:
| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `list_chat_models` | List all available AI models | None |
| `send_chat_message` | Send message to AI | messages, model, apiKey |
| `get_chat_status` | Get current chat status | None |

**Request Format**:
```typescript
{
  jsonrpc: "2.0",
  id: number,
  method: string,
  params?: any
}
```

---

## Data Flow

### AI Chat Flow

```
1. User types message ────────────────────────────────────────┐
   └─> Input state updates                                   │
2. User clicks Send                                          │
   └─> setLoading(true)                                       │
3. Update session with user message                          │
   └─> localStorage updated                                 │
4. POST /api/chat                                           │
   └─> Stream response                                       │
5. Parse SSE events                                          │
   └─> Update messages in real-time                          │
6. Messages update UI                                         │
7. Session saved to localStorage                            │
   └─────────────────────────────────────────────────────────┘
```

### Persistence Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Component     │────>│   Context/API    │────>│  localStorage   │
│   (React)       │     │   (Hooks)        │     │  (Browser)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                         │
                              └──────────┬──────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │   DB API (Optional) │
                              │  /api/db/sessions   │
                              └─────────────────────┘
```

---

## Security Considerations

| Aspect | Implementation |
|--------|---------------|
| API Key Storage | localStorage (client-side only) |
| API Key Exposure | Never sent to server, used only in fetch |
| CORS | OpenRouter API handles CORS |
| XSS Prevention | Content sanitized via React |
| Rate Limiting | Handled by OpenRouter |

---

## Performance Optimizations

| Feature | Optimization |
|---------|-------------|
| Chat History | localStorage for fast access |
| Message Rendering | Virtual scrolling possible for large histories |
| API Calls | AbortController for cancellation |
| Bundle Size | Dynamic imports for heavy components |

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^16.2.4",
    "react": "^19.2.4",
    "@monaco-editor/react": "^4.6.0",
    "@headlessui/react": "^2.0.0",
    "@heroicons/react": "^2.2.0",
    "tailwindcss": "^4.0.0"
  }
}
```