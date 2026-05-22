# Technical Requirements Document: Santosh Puram's AI Tools - Online Code Editor

## 1. Executive Summary

This document outlines the technical requirements for building a VS Code-like online code editor with integrated AI Assistant capabilities, using Python backend with SQLite local database for storage.

**Project Name:** Santosh Puram's AI Tools
**Version:** 1.0
**Date:** Friday, May 22, 2026

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Code Editor │  │ AI Assistant │  │ Workspace Scanner    │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Menu Bar    │  │ Status Bar   │  │ Activity Bar         │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Layer                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ FastAPI     │  │ WebSocket    │  │ REST API             │   │
│  │ (Python)    │  │ Real-time    │  │ Endpoints            │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ SQLite      │  │ File System  │  │ OpenRouter API       │   │
│  │ (Local DB)  │  │ Storage      │  │ Integration          │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| Frontend | React + TypeScript | With Tailwind CSS |
| Backend | Python FastAPI | Async/await support |
| Database | SQLite | Local file-based storage |
| AI Integration | OpenRouter API | Free models support |
| Build Tool | Next.js 16 | App Router |
| Testing | Jest + Playwright | Unit, Integration, E2E |

## 3. Functional Requirements

### 3.1 Core Code Editor Features

#### 3.1.1 Editor Interface
- VS Code-style menu bar (File, Edit, View, Run, AI Assistant)
- Activity bar with navigation icons (Explorer, Search, Git, Debug, Run)
- File explorer with collapsible folders and file tree
- Tabbed editor interface with split-view support
- Status bar with line/column, language mode, encoding
- Resizable panels with drag handles

#### 3.1.2 Code Editing
- Syntax highlighting for 20+ languages
- Multi-cursor editing
- Find/Replace with regex support
- Code folding
- Line numbers and minimap
- Word wrap and font customization
- Auto-completion (IntelliSense)

### 3.2 AI Assistant Features

#### 3.2.1 AI Integration
- Connect to OpenRouter free models
- Model selection dropdown with display of active model
- Token usage tracking and display
- Workspace scanning capability
- Context-aware code suggestions

#### 3.2.2 AI Chat Interface
- Interactive chat with AI assistant
- Copy output functionality
- Professional output formatting
- Status indicator showing what the model is doing
- Predefined prompts for common operations
- Chat history tracking

### 3.3 Workspace Management

#### 3.3.1 File Operations
- Create new files and folders
- Open local folder (File System Access API)
- Save files locally
- Project-based file organization

#### 3.3.2 Configuration Management
- Run configurations with custom commands
- API key storage in configuration
- Model preferences persistence

### 3.4 Landing Page

#### 3.4.1 Entry Points
- Icon-based navigation to AI Chatbot
- Icon-based navigation to Code Editor
- Brand name: "Santosh Puram's AI Tools"

## 4. Data Requirements

### 4.1 SQLite Database Schema

```sql
-- Users table (optional for multi-user support)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_opened TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat History table
CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    model_used TEXT,
    token_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Configurations table
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    name TEXT NOT NULL,
    command TEXT NOT NULL,
    api_key_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Run Results table
CREATE TABLE run_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    configuration_id INTEGER,
    status TEXT NOT NULL,
    output TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    FOREIGN KEY (configuration_id) REFERENCES configurations(id)
);
```

## 5. API Requirements

### 5.1 REST API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/projects` | GET | List all projects | No |
| `/api/projects` | POST | Create new project | No |
| `/api/projects/{id}` | GET | Get project details | No |
| `/api/chat/history` | GET | Get chat history for project | No |
| `/api/chat/send` | POST | Send message to AI | No |
| `/api/config` | GET | Get configurations | No |
| `/api/config` | POST | Create configuration | No |
| `/api/run` | POST | Execute run configuration | No |

### 5.2 WebSocket Endpoints
- `/ws/chat` - Real-time AI chat streaming
- `/ws/terminal` - Terminal output streaming

## 6. Testing Requirements

### 6.1 Test Coverage Targets

| Test Type | Coverage Target | Framework |
|-----------|-----------------|-----------|
| Unit Tests | 80%+ | Jest |
| Integration Tests | 70%+ | Jest + Supertest |
| E2E Tests | 60%+ | Playwright |
| API Tests | 90%+ | Jest + Supertest |

### 6.2 Test Scenarios

#### 6.2.1 API Testing
```javascript
// Example API test cases
describe('Projects API', () => {
  // Positive scenarios
  test('should create a new project', async () => {...});
  test('should return project list', async () => {...});
  test('should return project details', async () => {...});
  
  // Negative scenarios
  test('should return 404 for non-existent project', async () => {...});
  test('should validate project name', async () => {...});
  
  // Edge cases
  test('should handle empty project list', async () => {...});
  test('should handle database connection failure', async () => {...});
});
```

#### 6.2.2 UI Testing
```javascript
// Example UI test cases
describe('Code Editor UI', () => {
  // Component tests
  test('should render menu bar correctly', async () => {...});
  test('should open file explorer on click', async () => {...});
  
  // Interaction tests
  test('should create new file via menu', async () => {...});
  test('should save file content', async () => {...});
  
  // E2E flows
  test('Complete new project flow', async () => {...});
  test('AI chat with code context', async () => {...});
});
```

### 6.3 Test Data Management
- Use SQLite in-memory database for unit tests
- Seed test data for integration tests
- Clean up after each test suite

## 7. Non-Functional Requirements

### 7.1 Performance
- Page load: < 2 seconds
- Editor response: < 100ms
- AI response: < 5 seconds (streaming)

### 7.2 Security
- API key encryption at rest
- No sensitive data in localStorage
- CORS configuration

### 7.3 Reliability
- Graceful degradation when AI services unavailable
- Local storage fallback for workspace data

## 8. Implementation Phases

### Phase 1: Core Editor Foundation
- Menu bar implementation
- File explorer component
- Basic code editor
- Tab management

### Phase 2: AI Integration
- OpenRouter API integration
- Chat interface
- Model selection
- Token tracking

### Phase 3: Workspace Features
- SQLite integration
- Project management
- Configuration storage
- Local folder support

### Phase 4: Polish & Testing
- Comprehensive testing
- Performance optimization
- UI/UX refinement

## 9. Deployment Requirements

### 9.1 Environment Variables
```
OPENROUTER_API_KEY=<api_key>
DATABASE_PATH=./data/app.db
NODE_ENV=production
```

### 9.2 Build Commands
```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Testing
npm run test
npm run test:e2e
```

## 10. Success Criteria

- [ ] Menu bar with VS Code-style menus visible on load
- [ ] File explorer displays workspace correctly
- [ ] AI Assistant can scan workspace and provide responses
- [ ] Chat history persists in SQLite database
- [ ] Model name and token usage displayed in UI
- [ ] All 173+ tests passing
- [ ] Landing page with two navigation icons
- [ ] Brand name "Santosh Puram's AI Tools" displayed
- [ ] End-to-end testing for APIs and UI

---

**Document Owner:** Santosh Puram  
**Last Updated:** Friday, May 22, 2026