FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source
COPY index.js ./

# Expose port
EXPOSE 3002

# Default to HTTP mode for remote access
ENV MCP_TRANSPORT=http
ENV MCP_PORT=3002

CMD ["node", "index.js"]