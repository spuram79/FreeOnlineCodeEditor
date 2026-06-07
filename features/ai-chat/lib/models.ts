/**
 * AI Chat Feature - Models Configuration
 * 
 * This file contains all free models available from OpenRouter.
 * Can be moved to a separate project by copying this file.
 * Last updated: May 8, 2026
 */

import { Model } from "../types";

export const FREE_MODELS: Model[] = [
  { id: "openrouter/free", name: "Perplexity AI", description: "Auto-selects the best free model", focusModeSupport: true },
  { id: "openrouter/owl-alpha", name: "Owl Alpha", description: "High-performance model for agentic workloads", focusModeSupport: true },
  { id: "baidu/cobuddy:free", name: "Baidu CoBuddy", description: "Code generation model optimized for coding tasks" },
  { id: "google/gemma-4-26b-a4b-it:free", name: "Gemma 4 26B A4B", description: "Mixture-of-Experts model from Google", focusModeSupport: true },
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", description: "30.7B dense multimodal model from Google", focusModeSupport: true },
  { id: "liquid/lfm-2.5-1.2b-instruct:free", name: "LFM 2.5 1.2B Instruct", description: "Compact instruction-tuned model for fast on-device", focusModeSupport: true },
  { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "LFM 2.5 1.2B Thinking", description: "Lightweight reasoning-focused model" },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B Instruct", description: "3B multilingual instruction model", focusModeSupport: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", description: "70B multilingual instruction model", focusModeSupport: true },
  { id: "minimax/minimax-m2.5:free", name: "MiniMax M2.5", description: "SOTA model for real-world productivity", focusModeSupport: true },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B", description: "Generalist model with advanced agentic capabilities", focusModeSupport: true },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", name: "Nemotron 3 Nano 30B", description: "Small MoE model with high compute efficiency" },
  { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", name: "Nemotron 3 Nano Omni", description: "Multimodal reasoning model" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super 120B", description: "120B hybrid MoE model", focusModeSupport: true },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B VL", description: "Multimodal reasoning model for video" },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2", description: "9B parameter model trained from scratch" },
  { id: "openai/gpt-oss-120b:free", name: "GPT OSS 120B", description: "Open-weight 117B MoE model from OpenAI", focusModeSupport: true },
  { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", description: "Open-weight 21B parameter model", focusModeSupport: true },
  { id: "poolside/laguna-m.1:free", name: "Poolside Laguna M.1", description: "Flagship coding agent model", focusModeSupport: true },
  { id: "poolside/laguna-xs.2:free", name: "Poolside Laguna XS.2", description: "Second-gen XS coding model", focusModeSupport: true },
  { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder", description: "Mixture-of-Experts code generation model" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen3 Next 80B", description: "Instruction-tuned chat model", focusModeSupport: true },
  { id: "tencent/hy3-preview:free", name: "Tencent Hy3", description: "High-efficiency MoE model for agentic workflow", focusModeSupport: true },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice Uncensored", description: "Uncensored variant of Mistral-Small-24B" },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Lightweight variant of GLM flagship model", focusModeSupport: true },
];

export const DEFAULT_MODEL = "openrouter/free";

export const FOCUS_MODES = [
  { id: "web", name: "Web Search", icon: "🌐", description: "Search the web for current information" },
  { id: "academic", name: "Academic", icon: "📚", description: "Search academic papers and sources" },
  { id: "writing", name: "Writing", icon: "✍️", description: "Help with writing and editing" },
  { id: "coding", name: "Coding", icon: "💻", description: "Get help with programming" },
  { id: "math", name: "Math", icon: "🔢", description: "Solve mathematical problems" },
];