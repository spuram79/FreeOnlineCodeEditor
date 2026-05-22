/**
 * AI Chat API Route (Next.js App Router)
 * 
 * This API route acts as a proxy to OpenRouter.
 * When using the external microservice, set NEXT_PUBLIC_USE_MICROSERVICE=true
 * and the frontend will call the microservice directly instead.
 * 
 * The microservice implementation is in /ai-chat-api/index.js
 */

import { NextRequest, NextResponse } from "next/server";
import { FREE_MODELS } from "@/features/ai-chat";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return NextResponse.json({ models: FREE_MODELS });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model, apiKey: clientApiKey } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    if (!model) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    // Use client-provided API key or fall back to server-side env variable
    const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured. Please add your API key in settings or set OPENROUTER_API_KEY environment variable." }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://sb-2r05376a349z.vercel.run",
        "X-Title": "Free AI Chat",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: error || "API request failed" }, { status: response.status });
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Usage-In-Stream": "true", // Signal that usage data is in the stream
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}