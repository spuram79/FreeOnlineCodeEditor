# Santosh Puram's AI Tools

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Code Editor** - Edit HTML, CSS, JavaScript, Python, C#, and Java with live preview
- **AI Chat** - Chat with 30+ free AI models from OpenRouter

## Documentation

Comprehensive technical documentation is available in the `/docs` directory:

- [Technical Overview](./docs/TECHNICAL_DOCS.md) - Architecture, data flow, and project structure
- [AI Chat Documentation](./docs/ai-chat-docs.md) - Component hierarchy, state management, and API integration
- [Code Editor Documentation](./docs/code-editor-docs.md) - Editor components, Python Colab mode, and execution flow
- [API Documentation](./docs/api-docs.md) - API routes documentation

## Microservice (Optional)

The AI Chat API can be run as a standalone microservice, allowing you to use it from any application:

```bash
# Navigate to the microservice directory
cd ai-chat-api

# Use Docker Compose (recommended)
docker-compose up -d

# Or run directly with Node.js
npm install
OPENROUTER_API_KEY=your_key npm start
```

To use the microservice from this app, set the environment variable:
```
NEXT_PUBLIC_USE_MICROSERVICE=true
NEXT_PUBLIC_MICROSERVICE_URL=http://localhost:3001
```

See [ai-chat-api/README.md](./ai-chat-api/README.md) for more details.

## MCP Server (Optional)

Use the AI Chat API from any MCP-compatible client (like Claude Desktop):

```bash
cd ai-chat-mcp
npm install
OPENROUTER_API_KEY=your_key node index.js
```

See [ai-chat-mcp/README.md](./ai-chat-mcp/README.md) for configuration examples.

## AI Chat

The AI Chat app uses free models from [OpenRouter](https://openrouter.ai/models). To use it:

1. Get a free API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Open the AI Chat app from the main page
3. Enter your API key in the settings (gear icon)
4. Select a model and start chatting!

### Available Free Models

- OpenRouter Free (auto-selects best model)
- Meta Llama 3.2 3B & 3.3 70B
- Google Gemma 4 26B & 31B
- OpenAI GPT OSS 120B & 20B
- NVIDIA Nemotron 3 Nano & Super
- Qwen3 Coder & Next 80B
- Poolside Laguna (coding models)
- And many more!

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
