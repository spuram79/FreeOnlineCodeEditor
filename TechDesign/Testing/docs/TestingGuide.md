# Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the FreeOnlineCodeEditor application, including test strategies, test cases, and test execution procedures for all environments.

---

## Table of Contents

1. [Test Strategy](#test-strategy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Test Cases by Feature](#test-cases-by-feature)
7. [Test Execution Matrix](#test-execution-matrix)
8. [CI/CD Pipeline](#cicd-pipeline)

---

## Test Strategy

### Testing Pyramid

```
          ┌─────────────────┐
          │   E2E Tests     │  (5-10%) - Critical user flows
          └─────────────────┘
          ┌─────────────────┘
    ┌─────────────────┐
    │ Integration     │  (15-20%) - API and component interactions
    └─────────────────┘
┌─────────────────┐
│   Unit Tests    │  (65-70%) - Individual functions/components
└─────────────────┘
```

### Test Types

| Test Type | Scope | Tools | Coverage Target |
|-----------|-------|-------|-----------------|
| Unit Tests | Individual functions | Jest, React Testing Library | 80%+ |
| Integration Tests | API routes, component interactions | Supertest, Jest | 70%+ |
| E2E Tests | User workflows | Cypress/Puppeteer | 10-15% |
| Performance Tests | Load and stress | Artillery | Critical paths |
| Security Tests | Vulnerability scanning | OWASP ZAP | Pre-deployment |

---

## Test Environment Setup

### Local Test Environment

```bash
# Install test dependencies
pnpm install --dev

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test MessageBubble.test.tsx

# Run tests in watch mode
pnpm test:watch
```

### Test Configuration Files

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest configuration |
| `jest.setup.ts` | Global test setup |
| `__mocks__/` | Mock implementations |

---

## Unit Tests

### AI Chat Feature Tests

#### 1. MessageBubble Component Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `renders user message correctly` | User message displays with correct styling | Blue background, right-aligned |
| `renders AI message correctly` | AI message displays with correct styling | White background, left-aligned |
| `renders markdown content` | Markdown is converted to HTML | Proper HTML elements rendered |
| `shows copy button for AI messages` | Copy button appears on AI response | Button visible on hover |
| `shows download button for AI messages` | Download button appears on AI response | TXT/MD options available |
| `copy-to-clipboard works` | Clicking copy copies text | Clipboard contains message content |
| `follow-up questions render` | Follow-up questions display as buttons | Buttons appear below message |
| `clicking follow-up sets input` | Click follow-up populates input field | Input field updated |

#### 2. ChatHistorySidebar Component Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `renders conversation list` | Sessions display correctly | List of conversations shown |
| `creates new conversation` | New chat button creates session | New session in list |
| `deletes conversation` | Delete button removes session | Session removed from list |
| `selects conversation` | Clicking session loads it | Session becomes active |
| `exports as text` | Export text option works | Text file downloads |
| `exports as markdown` | Export markdown option works | Markdown file downloads |
| `exports as JSON` | Export JSON option works | JSON file downloads |

#### 3. Models Utility Tests

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `loads all models` | 30+ models are loaded | Array of 30+ models |
| `default model is correct` | Default is `openrouter/free` | First model is correct |
| `model structure is valid` | Each model has required fields | id, name, description exist |

---

## Integration Tests

### API Route Tests

#### Chat API (`/api/chat`)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `POST valid request` | Valid message sent | Returns streaming response |
| `POST missing messages` | No messages array | 400 error |
| `POST missing model` | No model specified | 400 error |
| `POST missing apiKey` | No API key | 500 error handled |
| `POST null values` | Null in request body | Error handled gracefully |
| `POST empty array` | Empty messages array | Valid response |
| `Abort request` | Stop button clicked | Request cancelled |

#### MCP API (`/api/mcp`)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET capabilities` | Request server info | Returns capabilities JSON |
| `POST initialize` | Initialize request | Returns protocol version |
| `POST tools/list` | List tools request | Returns available tools |
| `POST tools/call` | Execute tool | Returns tool result |
| `Invalid method` | Unknown method | Error response |

### Database Persistence Tests

#### Session API (`/api/db/sessions`)

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `POST create session` | Create new session | Session created, returns ID |
| `GET sessions` | List all sessions | Returns array of sessions |
| `DELETE session` | Delete single session | Session removed |
| `PUT update session` | Update existing session | Session updated |
| `DELETE all sessions` | Delete all | All removed |

---

## End-to-End Tests

### Critical User Flows

#### Flow 1: New Conversation

```
1. User opens application
2. Application loads
3. AI greeting displays
4. User types message
5. Message sends
6. AI responds
7. Response displays with copy/download options
```

#### Flow 2: Chat History

```
1. User starts conversation
2. Sends multiple messages
3. Opens chat history sidebar
4. Sees saved conversation
5. Clicks to load conversation
6. Previous messages display
```

#### Flow 3: Export Conversation

```
1. User has active conversation
2. Clicks Export button
3. Selects format (Text/Markdown/JSON)
4. File downloads
5. File contains correct content
```

#### Flow 4: Copy Response

```
1. AI responds with message
2. Clicks Copy button on response
3. Clipboard contains response text
4. UI shows "Copied!" confirmation
```

---

## Test Cases by Feature

### Feature: AI Chat

| ID | Test Case | Priority | Environment |
|----|-----------|----------|-------------|
| AI-001 | Send message to AI | High | All |
| AI-002 | Stream response display | High | All |
| AI-003 | Model selection | Medium | All |
| AI-004 | API key validation | High | All |
| AI-005 | Stop generation | Medium | All |
| AI-006 | Follow-up questions | Low | All |
| AI-007 | Source citations | Medium | All |

### Feature: Chat History

| ID | Test Case | Priority | Environment |
|----|-----------|----------|-------------|
| CH-001 | Save conversation | High | All |
| CH-002 | Load conversation | High | All |
| CH-003 | Delete conversation | Medium | All |
| CH-004 | Export conversation | Medium | All |
| CH-005 | Auto-title generation | Low | All |

### Feature: Code Editor

| ID | Test Case | Priority | Environment |
|----|-----------|----------|-------------|
| CE-001 | HTML live preview | High | All |
| CE-002 | JavaScript execution | High | All |
| CE-003 | Python execution | High | All |
| CE-004 | Language switching | Medium | All |
| CE-005 | Template loading | Low | All |

### Feature: Copy/Download

| ID | Test Case | Priority | Environment |
|----|-----------|----------|-------------|
| CD-001 | Copy single response | High | All |
| CD-002 | Download as TXT | High | All |
| CD-003 | Download as Markdown | Medium | All |
| CD-004 | Export whole conversation | High | All |
| CD-005 | Clipboard API fallback | Medium | All |

---

## Test Execution Matrix

### Pre-Deployment Checklist

| Environment | Unit Tests | Integration | E2E | Manual QA |
|-------------|------------|-------------|-----|-----------|
| Local Dev | ✅ Required | ✅ Required | ❌ Optional | ❌ Optional |
| SIT | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| UAT | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| Production | ❌ Optional | ❌ Optional | ❌ Optional | ✅ Required |

### Test Coverage Goals

| Metric | Target | Threshold |
|--------|--------|-----------|
| Unit Test Coverage | 80% | 70% minimum |
| Integration Coverage | 70% | 60% minimum |
| Critical Paths E2E | 100% | 100% minimum |
| Accessibility Score | 90+ | 80 minimum (Lighthouse) |
| Performance Score | 90+ | 80 minimum (Lighthouse) |

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Test Suite

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

### Quality Gates

| Gate | Condition | Action |
|------|-----------|--------|
| Build | Must pass | Block merge |
| Tests | 70%+ coverage | Block merge |
| Linting | No errors | Block merge |
| Security | No high vulns | Block merge |

---

## Running Tests

### Quick Start

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run specific test
pnpm test --testNamePattern="copy"
```

### Test Reporting

| Reporter | Output |
|----------|--------|
| Console | Real-time output |
| Coverage | HTML report in `coverage/` |
| JUnit | XML for CI systems |

---

## Troubleshooting

### Common Test Issues

| Issue | Solution |
|-------|----------|
| `TestingLibraryElementError` | Wait for element with `findBy*` |
| `act()` warning | Wrap updates in `act()` or `waitFor()` |
| `localStorage` errors | Add mock for localStorage |
| `ResizeObserver` error | Add mock for ResizeObserver |
| API test failures | Check mock server handles requests |

### Debug Mode

```bash
# Run tests with debug output
DEBUG=true pnpm test

# Run specific test with verbose output
pnpm test --verbose MessageBubble
```