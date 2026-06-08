# Ubuntu Docker Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Docker Installation](#docker-installation)
3. [Deployment Steps](#deployment-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Monitoring & Logs](#monitoring--logs)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Ubuntu 20.04 LTS or 22.04 LTS
- Docker Engine 24.x or higher
- Docker Compose 2.x or higher (optional)
- At least 2GB RAM, 2 CPU cores
- OpenRouter API key

---

## Docker Installation

### Install Docker on Ubuntu

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify installation
sudo docker --version
sudo docker compose version

# Add current user to docker group (optional, requires logout/login)
sudo usermod -aG docker $USER
```

---

## Deployment Steps

### Option 1: Quick Deployment (SQLite - Development)

```bash
# Clone the repository
git clone https://github.com/spuram79/FreeOnlineCodeEditor.git
cd FreeOnlineCodeEditor

# Create environment file
cat > .env << EOF
OPENROUTER_API_KEY=sk-or-your-api-key-here
NEXT_PUBLIC_SITE_URL=http://your-domain.com
DATABASE_PATH=/app/data/chat-database.db
NEXT_TELEMETRY_DISABLED=1
EOF

# Build the Docker image
docker build -t ai-chat-app .

# Run the container
docker run -d \
  --name ai-chat-production \
  -p 3000:3000 \
  --restart unless-stopped \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/.env:/app/.env \
  ai-chat-app
```

### Option 2: Production Deployment (PostgreSQL)

#### Step 1: Setup PostgreSQL

```bash
# Create docker network for app and database
docker network create ai-chat-network

# Create volume for database persistence
docker volume create postgres-data

# Run PostgreSQL container
docker run -d \
  --name ai-chat-postgres \
  --network ai-chat-network \
  -e POSTGRES_DB=ai_chat \
  -e POSTGRES_USER=ai_user \
  -e POSTGRES_PASSWORD=$(openssl rand -hex 16) \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:16-alpine

# Get the generated password
echo "PostgreSQL password stored in container logs. Check with: docker logs ai-chat-postgres | head -n 1"
```

#### Step 2: Update Environment

```bash
# Get PostgreSQL container IP
POSTGRES_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ai-chat-postgres)

# Create production environment file
cat > .env.production << EOF
OPENROUTER_API_KEY=sk-or-your-api-key-here
DATABASE_URL=postgresql://ai_user:YOUR_PASSWORD@${POSTGRES_IP}:5432/ai_chat
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
LOG_LEVEL=warn
EOF
```

#### Step 3: Deploy with Docker Compose

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: ai-chat-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    volumes:
      - postgres-data:/var/lib/postgresql/data
    depends_on:
      - postgres
    networks:
      - ai-chat-network

  postgres:
    image: postgres:16-alpine
    container_name: ai-chat-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=ai_chat
      - POSTGRES_USER=ai_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - ai-chat-network

  nginx:
    image: nginx:alpine
    container_name: ai-chat-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - ai-chat-network

volumes:
  postgres-data:

networks:
  ai-chat-network:
    driver: bridge
```

Create `.env.production`:

```bash
cat > .env.production << EOF
OPENROUTER_API_KEY=sk-or-your-api-key-here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
POSTGRES_PASSWORD=$(openssl rand -hex 16)
EOF
```

Deploy:

```bash
docker compose --env-file .env.production up -d
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key |
| `DATABASE_URL` | For PostgreSQL | PostgreSQL connection string |
| `DATABASE_PATH` | For SQLite | Path to SQLite database file |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your application URL |
| `NODE_ENV` | No | Set to `production` for production builds |
| `NEXT_TELEMETRY_DISABLED` | No | Set to `1` to disable Next.js telemetry |

### Nginx Configuration

Create `nginx.conf` for reverse proxy with HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for SSE
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check endpoint
    location /api/mcp {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
    }
}
```

### SSL Certificate Setup

```bash
# Install certbot
sudo apt install -y certbot

# Obtain SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
mkdir -p ./ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem
```

---

## Running the Application

### Start Services

```bash
# Start all services
docker compose --env-file .env.production up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Stop Services

```bash
docker compose down
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose build --no-cache
docker compose up -d
```

### Database Migration (PostgreSQL)

```bash
# Generate Prisma migration
docker run --rm \
  -v $(pwd):/app \
  -w /app \
  --env-file .env.production \
  node:20-alpine \
  sh -c "npm install -g pnpm && pnpm install && npx prisma generate && npx prisma db push"
```

---

## Monitoring & Logs

### View Application Logs

```bash
# All logs
docker compose logs -f

# Specific service logs
docker logs -f ai-chat-app
docker logs -f ai-chat-postgres

# Last 100 lines
docker logs --tail 100 ai-chat-app
```

### Health Checks

```bash
# Check if service is running
curl -I http://localhost:3000/api/mcp

# Expected response: 200 OK with JSON
curl http://localhost:3000/api/mcp | jq .

# Check database connection
docker exec ai-chat-postgres pg_isready
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Cleanup unused resources
docker system prune -a
```

---

## Backup & Recovery

### Database Backup (PostgreSQL)

```bash
# Create backup
docker exec ai-chat-postgres pg_dump -U ai_user ai_chat > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260608.sql | docker exec -i ai-chat-postgres psql -U ai_user ai_chat
```

### SQLite Backup

```bash
# Copy the database file
cp data/chat-database.db backups/chat-database_$(date +%Y%m%d).db

# Restore
cp backups/chat-database_20260608.db data/chat-database.db
```

### Full Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup SQLite
cp data/chat-database.db $BACKUP_DIR/

# Backup environment
cp .env.production $BACKUP_DIR/

# Backup Nginx
cp nginx.conf $BACKUP_DIR/

echo "Backup created at $BACKUP_DIR"
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Change port mapping: `-p 3001:3000` |
| Database connection failed | Check `DATABASE_URL` and container network |
| API key error | Verify `OPENROUTER_API_KEY` is valid |
| Out of memory | Increase Docker memory limit or add swap |

### Debug Commands

```bash
# Enter container shell
docker exec -it ai-chat-app sh

# Check environment variables
docker exec ai-chat-app env | grep -E "(OPENROUTER|DATABASE|NEXT)"

# Test database connection
docker exec ai-chat-app wget -qO- http://localhost:3000/api/mcp

# Check container resources
docker inspect ai-chat-app | jq '.[0].State'
```

---

## Quick Reference Commands

```bash
# Deploy fresh
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Update
git pull && docker compose up -d --build

# Backup
docker exec ai-chat-postgres pg_dump -U ai_user ai_chat > backup.sql

# Restore
docker exec -i ai-chat-postgres psql -U ai_user ai_chat < backup.sql
```

---

## Support

For issues or questions, please open an issue on GitHub:
https://github.com/spuram79/FreeOnlineCodeEditor/issues