#!/usr/bin/env node
/**
 * AI Chat MCP Server
 * 
 * A Model Context Protocol server that provides access to the AI Chat API microservice.
 * This allows any MCP-compatible client to use OpenRouter's free AI models.
 * 
 * Part of Santosh Puram's AI Tools
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Configuration - can be overridden via environment variables
const API_BASE_URL = process.env.AI_CHAT_API_URL || "http://localhost:3001";
const DEFAULT_MODEL = process.env.AI_CHAT_DEFAULT_MODEL || "openrouter/free";
const API_KEY = process.env.OPENROUTER_API_KEY || "";

// List of available tools
const TOOLS = [
  {
    name: "chat",
    description: "Send a message to an AI model and get a response. Supports streaming for real-time responses.",
    inputSchema: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant"] },
              content: { type: "string" }
            },
            required: ["role", "content"]
          },
          description: "Array of conversation messages"
        },
        model: {
          type: "string",
          description: `Model ID to use (default: ${DEFAULT_MODEL})`,
          default: DEFAULT_MODEL
        },
        apiKey: {
          type: "string",
          description: "OpenRouter API key (optional if OPENROUTER_API_KEY is set)"
        },
        temperature: {
          type: "number",
          description: "Temperature for response randomness (0-2)",
          default: 0.7
        },
        max_tokens: {
          type: "number",
          description: "Maximum tokens in response"
        }
      },
      required: ["messages"]
    }
  },
  {
    name: "list_models",
    description: "List all available free AI models from OpenRouter",
    inputSchema: {}
  },
  {
    name: "health_check",
    description: "Check if the AI Chat API microservice is running",
    inputSchema: {}
  }
];

// Create the MCP server
const server = new Server(
  {
    name: "ai-chat-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "models://list",
        name: "Available Models",
        description: "List of all free AI models available from OpenRouter",
        mimeType: "application/json"
      }
    ]
  };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "models://list") {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    return {
      contents: [{
        uri: "models://list",
        text: JSON.stringify(data.models, null, 2),
        mimeType: "application/json"
      }]
    };
  }
  throw new Error(`Unknown resource: ${request.params.uri}`);
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_models": {
      try {
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return {
          content: [{
            type: "text",
            text: `Available Models (${data.models.length} total):\n\n` +
              data.models.map((m, i) => 
                `${i + 1}. **${m.name}** (\`${m.id}\`)\n   ${m.description}`
              ).join("\n\n")
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching models: ${error.message}`
          }],
          isError: true
        };
      }
    }

    case "health_check": {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
        const data = await response.json();
        return {
          content: [{
            type: "text",
            text: `✅ AI Chat API is running\nStatus: ${data.status}\nService: ${data.service}\nTimestamp: ${data.timestamp}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ AI Chat API is not reachable: ${error.message}\n\nMake sure the microservice is running:\n  cd ai-chat-api && npm start`
          }],
          isError: true
        };
      }
    }

    case "chat": {
      const { messages, model = DEFAULT_MODEL, apiKey, temperature, max_tokens } = args;
      
      if (!messages || !Array.isArray(messages)) {
        return {
          content: [{
            type: "text",
            text: "❌ Error: messages array is required"
          }],
          isError: true
        };
      }

      const key = apiKey || API_KEY;
      if (!key) {
        return {
          content: [{
            type: "text",
            text: "❌ Error: OpenRouter API key is required. Set OPENROUTER_API_KEY environment variable or provide apiKey in the request."
          }],
          isError: true
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            messages,
            model,
            temperature,
            max_tokens,
            stream: false
          })
        });

        if (!response.ok) {
          const error = await response.text();
          return {
            content: [{
              type: "text",
              text: `❌ Chat API error: ${error}`
            }],
            isError: true
          };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "No response generated";
        const usage = data.usage;

        let resultText = content;
        if (usage) {
          resultText += `\n\n---\n**Usage:** ${usage.total_tokens || 0} tokens (${usage.prompt_tokens || 0} prompt + ${usage.completion_tokens || 0} completion)`;
        }

        return {
          content: [{
            type: "text",
            text: resultText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Chat error: ${error.message}`
          }],
          isError: true
        };
      }
    }

    default:
      return {
        content: [{
          type: "text",
          text: `❌ Unknown tool: ${name}`
        }],
        isError: true
      };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AI Chat MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});