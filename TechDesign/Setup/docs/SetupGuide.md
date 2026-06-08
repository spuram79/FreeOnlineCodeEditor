# Setup Guide

## Overview

This document provides step-by-step instructions for setting up the FreeOnlineCodeEditor in different environments: **Local**, **SIT (System Integration Testing)**, **UAT (User Acceptance Testing)**, and **Production**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development Setup](#local-development-setup)
4. [System Integration Testing (SIT) Setup](#sit-setup)
5. [User Acceptance Testing (UAT) Setup](#uat-setup)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.x or higher | Required for running the application |
| pnpm | 9.x+ | Package manager (recommended) |
| npm | 10.x+ | Alternative to pnpm |
| OpenRouter API Key | N/A | Free at [openrouter.ai/keys](https://openrouter.ai/keys) |

---

## Environment Variables

### Required Variables

Create the appropriate `.env` file based on your environment:

#### Common Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | API key for OpenRouter AI models | `sk-or-xxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the application | `https://your-domain.com` |

#### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Environment mode | `development` |
| `ANALYZE` | Bundle analyzer | `false` |

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor
```

### Step 2: Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

**.env.local** contents:
```env
OPENROUTER_API_KEY=sk-or-your-api-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_TELEMETRY_DISABLED=1
```

### Step 4: Run Development Server

```bash
pnpm run dev
# or
npm run dev
```

### Step 5: Access Application

Open your browser and navigate to: **http://localhost:3000**

### Local Development Features

| Feature | How to Access |
|---------|---------------|
| AI Chat | Click "AI Chat" in navigation or go to `/ai-chat` |
| Code Editor | Click "Code Editor" in navigation or go to `/editor` |
| Chat History | Click the chat icon in AI Chat header |

---

## SIT (System Integration Testing) Setup

### Environment: SIT

**File**: `.env.sit`

```env
OPENROUTER_API_KEY=sk-or-sit-api-key
NEXT_PUBLIC_SITE_URL=https://sit.your-domain.com
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=debug
```

### Deployment Steps

#### Option 1: Direct Deployment

```bash
# Set environment for SIT
export NODE_ENV=development
export OPENROUTER_API_KEY=sk-or-sit-api-key
export NEXT_PUBLIC_SITE_URL=https://sit.your-domain.com

# Build the application
pnpm run build

# Start the server
pnpm run start
```

#### Option 2: Docker Deployment

```bash
# Create SIT environment file
cat > .env.sit << EOF
OPENROUTER_API_KEY=sk-or-sit-api-key
NEXT_PUBLIC_SITE_URL=https://sit.your-domain.com
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=debug
EOF

# Build and run
docker build -t free-online-code-editor:sit .
docker run -d -p 3000:3000 --env-file .env.sit free-online-code-editor:sit
```

### SIT Verification Checklist

- [ ] All 6 language editors (HTML/CSS/JS, Python, C#, Java) work correctly
- [ ] AI chat connects to OpenRouter with SIT API key
- [ ] Multiple AI models respond correctly
- [ ] Chat history persists in browser
- [ ] MCP endpoint (`/api/mcp`) returns correct response
- [ ] Responsive design works on tablet and desktop
- [ ] Dark/Light mode toggle functions

---

## UAT (User Acceptance Testing) Setup

### Environment: UAT

**File**: `.env.uat`

```env
OPENROUTER_API_KEY=sk-or-uat-api-key
NEXT_PUBLIC_SITE_URL=https://uat.your-domain.com
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL=warn
ANALYZE=true
```

### Deployment Steps

```bash
# Build for UAT
pnpm run build

# Analyze bundle size
pnpm run analyze

# Start production server
pnpm run start
```

### UAT Verification Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| User can edit code in all languages | Code editor accepts input |
| Live preview works for HTML/CSS/JS | Preview updates in real-time |
| Python code executes correctly | Output displays in preview |
| AI chat sends messages | Response appears after sending |
| Multiple models can be selected | Different models respond |
| Chat history saves | Refresh maintains conversation |
| Export conversation works | File downloads successfully |
| Copy to clipboard works | Content copied to system clipboard |
| Settings modal opens/saves | API key persists |
| Mobile responsiveness | Layout adjusts for small screens |

### User Acceptance Criteria

1. **Performance**: Page load < 3 seconds
2. **API Response**: AI response < 10 seconds
3. **Memory Usage**: < 500MB browser tab
4. **Compatibility**: Chrome, Firefox, Safari, Edge latest versions

---

## Production Deployment

### Environment: Production

**File**: `.env.production`

```env
OPENROUTER_API_KEY=sk-or-production-api-key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
LOG_LEVEL=error
```

### Deployment Options

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Vercel Environment Variables**:
1. Go to Project Settings → Environment Variables
2. Add:
   - `OPENROUTER_API_KEY` (Production)
   - `NEXT_PUBLIC_SITE_URL` (Production)

#### Option 2: Docker Container

```bash
# Build production image
docker build -t free-online-code-editor:production .

# Run with production environment
docker run -d -p 3000:3000 \
  -e OPENROUTER_API_KEY=sk-or-production-api-key \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e NODE_ENV=production \
  --name code-editor-app \
  free-online-code-editor:production
```

#### Option 3: Docker Compose

**docker-compose.production.yml**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENROUTER_API_KEY=sk-or-production-api-key
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker-compose -f docker-compose.production.yml up -d
```

#### Option 4: Cloud Platform Deployments

##### AWS ECS/Fargate
```bash
# Build and push to ECR
docker build -t your-ecr-repo/app .
docker push your-ecr-repo/app

# Create ECS task definition with:
# - Container port: 3000
# - Environment variables
# - Log configuration
```

##### Azure Container Apps
```bash
az containerapp create \
  --name free-online-code-editor \
  --image your-registry.azurecr.io/app:latest \
  --environment your-environment \
  --ingress external \
  --set-env-vars OPENROUTER_API_KEY=xxxxx
```

##### Google Cloud Run
```bash
gcloud run deploy free-online-code-editor \
  --image gcr.io/your-project/app \
  --port 3000 \
  --set-env-vars OPENROUTER_API_KEY=xxxxx
```

### Production Health Checks

```bash
# Check application health
curl -f https://your-domain.com/api/mcp

# Expected response:
# {"jsonrpc":"2.0","name":"ai-chat-mcp",...}
```

---

## Troubleshooting

### Common Issues

#### 1. API Key Not Working
```bash
# Verify API key is set
echo $OPENROUTER_API_KEY

# Test API directly
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/chat/completions \
  -d '{"model":"openrouter/free","messages":[{"role":"user","content":"Hello"}]}'
```

#### 2. Development Server Won't Start
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
pnpm install

# Restart dev server
pnpm run dev
```

#### 3. Python Editor Not Loading
```bash
# Check browser console for errors
# Pyodide requires internet connection for initial load
# Clear browser cache if stuck
```

#### 4. Docker Build Fails
```bash
# Check Docker version
docker --version

# Clean build
docker builder prune -a
docker build --no-cache -t free-online-code-editor .
```

### Log Locations

| Environment | Log Location |
|-------------|--------------|
| Local Dev | Console / Terminal |
| Docker | `docker logs <container_id>` |
| Vercel | Vercel Dashboard → Logs |
| AWS ECS | CloudWatch Logs |
| Azure | Application Insights |
| GCP | Cloud Logging |

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/spuram79/FreeOnlineCodeEditor/issues
- OpenRouter Support: https://openrouter.ai/support