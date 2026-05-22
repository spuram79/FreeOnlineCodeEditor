/**
 * AI Chat API Microservice
 * 
 * Standalone microservice for OpenRouter AI chat completions.
 * Can be deployed independently and called from any application.
 * 
 * Original source: /app/api/chat/route.ts from Santosh Puram's AI Tools
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// Middleware
app.use(cors());
app.use(express.json());

// Free models list from OpenRouter
const FREE_MODELS = [
  { id: "openrouter/free", name: "Free Models Router", description: "Auto-selects the best free model" },
  { id: "openrouter/owl-alpha", name: "Owl Alpha", description: "High-performance model for agentic workloads" },
  { id: "baidu/cobuddy:free", name: "Baidu CoBuddy", description: "Code generation model optimized for coding tasks" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B A4B", description: "Mixture-of-Experts model from Google" },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", description: "30.7B dense multimodal model from Google" },
  { id: "liquid/lfm-2.5-1.2b-instruct:free", name: "LFM 2.5 1.2B Instruct", description: "Compact instruction-tuned model for fast on-device" },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "LFM 2.5 1.2B Thinking", description: "Lightweight reasoning-focused model" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B Instruct", description: "3B multilingual instruction model" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", description: "70B multilingual instruction model" },
  { id: "minimax/minimax-m2.5:free", name: "MiniMax M2.5", description: "SOTA model for real-world productivity" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B", description: "Generalist model with advanced agentic capabilities" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B", description: "Small MoE model with high compute efficiency" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni", description: "Multimodal reasoning model" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B", description: "120B hybrid MoE model" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B VL", description: "Multimodal reasoning model for video" },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2", description: "9B parameter model trained from scratch" },
  { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", description: "Open-weight 117B MoE model from OpenAI" },
  { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", description: "Open-weight 21B parameter model" },
  { id: "poolside/laguna-m.1:free", name: "Poolside Laguna M.1", description: "Flagship coding agent model" },
  { id: "poolside/laguna-xs.2:free", name: "Poolside Laguna XS.2", description: "Second-gen XS coding model" },
  { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder", description: "Mixture-of-Experts code generation model" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen3 Next 80B", description: "Instruction-tuned chat model" },
  { id: "tencent/hy3-preview:free", name: "Tencent Hy3", description: "High-efficiency MoE model for agentic workflow" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice Uncensored", description: "Uncensored variant of Mistral-Small-24B" },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Lightweight variant of GLM flagship model" }
];

// GET /models - List available free models
app.get('/models', (req, res) => {
  res.json({ models: FREE_MODELS });
});

// POST /chat - Chat completion endpoint
app.post('/chat', async (req, res) => {
  try {
    const { messages, model, apiKey } = req.body;

    // Validate request body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!model) {
      return res.status(400).json({ error: "Model is required" });
    }

    // Use client-provided API key or fall back to server-side env variable
    const key = apiKey || OPENROUTER_API_KEY;
    if (!key) {
      return res.status(500).json({ 
        error: "OpenRouter API key not configured. Please provide apiKey in request body or set OPENROUTER_API_KEY environment variable." 
      });
    }

    // Forward request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "AI Chat API",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: error || "API request failed" });
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } catch (e) {
      console.error("Stream error:", e);
    } finally {
      res.end();
    }

  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AI Chat API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AI Chat API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Models endpoint: http://localhost:${PORT}/models`);
  console.log(`Chat endpoint: http://localhost:${PORT}/chat`);
});