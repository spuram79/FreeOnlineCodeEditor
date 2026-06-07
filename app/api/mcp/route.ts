import { NextRequest, NextResponse } from "next/server";
import { FREE_MODELS } from "@/features/ai-chat";

/**
 * MCP (Model Context Protocol) endpoint for AI Chat features
 * Provides tools for interacting with the AI Chat functionality
 */

export const runtime = "edge";

// MCP Protocol version and server info
const MCP_VERSION = "2024-11-05";

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string; }>;
  };
}

interface McpRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

// Available tools
const TOOLS: McpTool[] = [
  {
    name: "list_chat_models",
    description: "List all available AI chat models from OpenRouter",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "send_chat_message",
    description: "Send a message to the AI chat and get a response",
    inputSchema: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          description: "Array of message objects with role and content"
        },
        model: {
          type: "string",
          description: "Model ID to use for the chat"
        },
        apiKey: {
          type: "string",
          description: "OpenRouter API key (optional if set server-side)"
        }
      }
    }
  },
  {
    name: "get_chat_status",
    description: "Get the status of the AI Chat service",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

export async function GET() {
  // Return MCP server info
  return NextResponse.json({
    jsonrpc: "2.0",
    name: "ai-chat-mcp",
    version: "1.0.0",
    protocolVersion: MCP_VERSION,
    capabilities: {
      tools: {
        list: TOOLS.map(t => t.name),
        call: true
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: McpRequest = await request.json();
    
    // Handle different MCP methods
    switch (body.method) {
      case "tools/list":
        return handleToolsList(body.id);
      
      case "tools/call":
        return handleToolCall(body.id, body.params);
      
      case "initialize":
        return handleInitialize(body.id, body.params);
      
      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`
          }
        }, { status: 400 });
    }
  } catch (error: unknown) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error",
        data: error instanceof Error ? error.message : String(error)
      }
    }, { status: 400 });
  }
}

function handleToolsList(id: string | number) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: {
      tools: TOOLS
    }
  });
}

interface ToolCallParams {
  name?: string;
  arguments?: Record<string, unknown>;
}

async function handleToolCall(id: string | number, params: ToolCallParams | undefined) {
  const { name, arguments: args } = params || {};
  
  switch (name) {
    case "list_chat_models":
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(FREE_MODELS, null, 2)
            }
          ]
        }
      });
    
    case "send_chat_message": {
      const { messages, model, apiKey: clientApiKey } = args || {};
      
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Messages array is required"
          }
        }, { status: 400 });
      }

      if (!model) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32602,
            message: "Model is required"
          }
        }, { status: 400 });
      }

      const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32000,
            message: "OpenRouter API key not configured. Please provide apiKey in arguments or set OPENROUTER_API_KEY environment variable."
          }
        }, { status: 500 });
      }

      // Call OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://sb-2r05376a349z.vercel.run",
          "X-Title": "Free AI Chat MCP",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32001,
            message: `API request failed: ${errorText}`
          }
        }, { status: response.status });
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "";

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: assistantMessage
            }
          ]
        }
      });
    }
    
    case "get_chat_status":
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "available",
                models_count: FREE_MODELS.length,
                default_model: "openrouter/free",
                endpoint: "/api/chat",
                mcp_endpoint: "/api/mcp"
              }, null, 2)
            }
          ]
        }
      });
    
    default:
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: {
          code: -32601,
          message: `Tool not found: ${name}`
        }
      }, { status: 400 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleInitialize(id: string | number, _params: unknown) {
  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    result: {
      protocolVersion: MCP_VERSION,
      capabilities: {
        tools: {
          list: TOOLS.map(t => t.name),
          call: true
        }
      },
      serverInfo: {
        name: "ai-chat-mcp",
        version: "1.0.0"
      }
    }
  });
}