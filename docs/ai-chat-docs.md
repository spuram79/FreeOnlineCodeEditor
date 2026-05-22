# AI Chat Application - Technical Documentation

## Overview

The AI Chat application is a comprehensive chatbot interface that provides access to multiple AI models through OpenRouter. It features conversation history, model selection, token tracking, and professional-grade output formatting.

## Architecture

### Component Hierarchy

```
AIChatPage
├── ChatHistoryProvider (Context)
│   ├── ConversationSidebar
│   │   └── ConversationList
│   │       └── ConversationItem
│   └── ChatInterface
│       ├── MessageList
│       │   └── MessageBubble (user & assistant)
│       ├── InputArea
│       │   ├── ModelSelector
│       │   └── MessageInput
│       └── StatusBar
└── SettingsModal
```

### File Structure

```
features/ai-chat/
├── components/
│   ├── MessageBubble.tsx        # Message display with copy functionality
│   └── SettingsModal.tsx        # Model configuration modal
├── lib/
│   ├── chat-history-context.tsx # React Context for conversation state
│   ├── models.ts                # Model definitions and utilities
│   └── model-utils.ts           # Model helper functions
├── types.ts                     # TypeScript interfaces
├── index.ts                     # Public API exports
└── ai-chat-docs.md              # This documentation
```

## Core Components

### MessageBubble.tsx

**Purpose**: Renders individual chat messages with professional formatting.

**Props**:
```typescript
interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
}
```

**Features**:
- Markdown rendering with syntax highlighting
- Copy-to-clipboard functionality
- Code block formatting
- User vs Assistant styling differentiation
- Timestamp display

**Usage**:
```tsx
<MessageBubble message={message} onCopy={handleCopy} />
```

### SettingsModal.tsx

**Purpose**: Configuration modal for model selection and parameters.

**Props**:
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}
```

**Features**:
- Model selection dropdown
- Temperature slider
- Max tokens configuration
- Model information display

### chat-history-context.tsx

**Purpose**: Centralized conversation state management.

**Context Value**:
```typescript
interface ChatHistoryContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  addConversation: () => void;
  updateConversation: (id: string, messages: Message[]) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
}
```

**State Shape**:
```typescript
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
}
```

## API Integration

### Chat API Route

**Endpoint**: `/app/api/chat/route.ts`

**Request Format**:
```typescript
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
}
```

**Response**: Streaming text response via Server-Sent Events

**Error Handling**:
- 400: Invalid request body
- 500: Internal server error

## Models

### Available Models

The application supports OpenRouter's free models. See `features/ai-chat/lib/models.ts` for the complete list.

**Model Configuration**:
```typescript
interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextLength: number;
  isFree: boolean;
}
```

## State Management

### Conversation Flow

1. **New Conversation**
   - Click "New Chat" button
   - Provider creates empty conversation
   - Sets as active conversation

2. **Sending Message**
   - User types message
   - Message added to active conversation
   - API call made
   - Streaming response updates assistant message

3. **Model Switching**
   - Settings modal allows model selection
   - Changes apply to new messages

## UI Components

### Status Bar

Displays real-time information:
- Current model indicator
- Token usage (input/output)
- Processing status
- Error messages

### Conversation Sidebar

- List of all conversations
- Search functionality
- Delete conversation option
- Conversation timestamps

## Styling

Uses Tailwind CSS with custom theme:
- Primary color: Blue (600-700 range)
- Dark mode support
- Responsive design
- Animation transitions

## Testing

### Test Files

```
features/ai-chat/
├── components/
│   ├── MessageBubble.test.tsx
│   └── SettingsModal.test.tsx
├── lib/
│   └── models.test.ts
└── ai-chat.test.ts
```

### Test Coverage

- Component rendering
- User interactions
- API integration
- Context state changes
- Error scenarios

## Performance Considerations

1. **Message Virtualization**: Large conversations use virtualized lists
2. **Code Splitting**: Routes loaded dynamically
3. **Caching**: API responses cached where appropriate
4. **Streaming**: Response streaming for better UX

## Security

- API keys stored server-side only
- Input sanitization
- Rate limiting considerations
- XSS prevention via React's default escaping

## Future Enhancements

- [ ] File upload support
- [ ] Image generation models
- [ ] Voice input/output
- [ ] Export conversations
- [ ] Custom system prompts