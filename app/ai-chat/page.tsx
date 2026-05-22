"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Model, FREE_MODELS, ChatHistoryProvider, useChatHistory, ChatHistorySidebar, ToolCall } from "@/features/ai-chat";

function ChatPageContent() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models] = useState<Model[]>(FREE_MODELS);
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentSession, createNewSession, updateSession, selectSession, updateTokenUsage } = useChatHistory();
  const messages = currentSession?.messages || [];
  const sessionId = currentSession?.id;
  
  // Get cumulative token usage for the current session
  const totalPromptTokens = currentSession?.totalPromptTokens || 0;
  const totalCompletionTokens = currentSession?.totalCompletionTokens || 0;
  const totalTokens = currentSession?.totalTokens || 0;

  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem("openrouter_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Create a new session if none exists
  useEffect(() => {
    if (!currentSession) {
      createNewSession(selectedModel);
    }
  }, [currentSession, createNewSession, selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
  };

  const handleNewChat = () => {
    createNewSession(selectedModel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
      const apiMessage: Message[] = [...messages, { role: "assistant", content: "Please enter your OpenRouter API key in settings first. Get a free key at openrouter.ai/keys" }];
      updateSession(sessionId!, apiMessage, selectedModel);
      setShowSettings(true);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    const userMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    updateSession(sessionId!, userMessages, selectedModel);
    setIsLoading(true);
    setStatusMessage("Connecting to " + (models.find((m) => m.id === selectedModel)?.name || selectedModel) + "...");

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userMessages,
          model: selectedModel,
          apiKey,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const assistantMessages: Message[] = [...userMessages, { role: "assistant", content: "" }];
      updateSession(sessionId!, assistantMessages, selectedModel);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let usageData: { promptTokens: number; completionTokens: number; totalTokens: number } | null = null;
      let toolCallsData: ToolCall[] | null = null;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              assistantMessage += content;
              
              // Update status message while streaming
              if (content && statusMessage !== "Generating response...") {
                setStatusMessage("Generating response...");
              }
              
              // Capture tool calls from the response
              if (parsed.choices?.[0]?.delta?.tool_calls) {
                toolCallsData = parsed.choices[0].delta.tool_calls as ToolCall[];
                setStatusMessage("Using tools: " + toolCallsData?.map(t => t.function.name).join(", "));
              }
              
              // Capture usage data from the response
              if (parsed.usage) {
                usageData = {
                  promptTokens: parsed.usage.prompt_tokens,
                  completionTokens: parsed.usage.completion_tokens,
                  totalTokens: parsed.usage.total_tokens,
                };
              }
              
              const updatedMessages: Message[] = [
                ...userMessages,
                { role: "assistant", content: assistantMessage }
              ];
              updateSession(sessionId!, updatedMessages, selectedModel);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Update token usage after streaming is complete
      if (usageData) {
        updateTokenUsage(
          sessionId!, 
          usageData.promptTokens, 
          usageData.completionTokens, 
          usageData.totalTokens,
          toolCallsData?.length || 0
        );
        
        // Update the last assistant message with usage info and tool calls
        const updatedMessagesWithUsage: Message[] = [
          ...userMessages,
          { 
            role: "assistant", 
            content: assistantMessage, 
            usage: usageData,
            toolCalls: toolCallsData || undefined
          }
        ];
        updateSession(sessionId!, updatedMessagesWithUsage, selectedModel);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        const errorMessages: Message[] = [...userMessages, { role: "assistant", content: `Error: ${error.message || "Something went wrong"}` }];
        updateSession(sessionId!, errorMessages, selectedModel);
        setStatusMessage("Error: " + (error.message || "Something went wrong"));
      }
    } finally {
      setIsLoading(false);
      // Clear status after a delay
      setTimeout(() => setStatusMessage(""), 3000);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Santosh Puram's AI Chat</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Powered by OpenRouter Free Models</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Chat History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <label className="text-sm text-gray-600 dark:text-gray-300">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.607 2.296.607 3.293 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {models.find((m) => m.id === selectedModel)?.description || "Select a model to get started"}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-blue-500" : "bg-purple-500"
                }`}>
                  <span className="text-white text-sm font-medium">
                    {message.role === "user" ? "U" : "AI"}
                  </span>
                </div>
                <div className={`px-4 py-3 rounded-lg relative group shadow-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                }`}>
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Tool Calls ({message.toolCalls.length})
                      </div>
                      {message.toolCalls.map((tool, toolIndex) => (
                        <div key={toolIndex} className="mt-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{tool.function.name}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(tool.function.arguments);
                                setCopiedIndex(index);
                                setTimeout(() => setCopiedIndex(null), 2000);
                              }}
                              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                              title="Copy arguments"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <pre className="text-xs text-gray-600 dark:text-gray-300 mt-1 overflow-x-auto max-h-20">
                            {JSON.stringify(JSON.parse(tool.function.arguments), null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  {message.role === "assistant" && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        setCopiedIndex(index);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title={copiedIndex === index ? "Copied!" : "Copy to clipboard"}
                    >
                      {copiedIndex === index ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Status Bar */}
      {isLoading && statusMessage && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">{statusMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Model Indicator - Professional Display */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {models.find((m) => m.id === selectedModel)?.name || selectedModel}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {models.find((m) => m.id === selectedModel)?.description || "AI Assistant"}
              </span>
            </div>
            {totalTokens > 0 && (
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Prompt:</span>
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{totalPromptTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                  <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{totalCompletionTokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded">
                  <span className="text-blue-600 dark:text-blue-400">Total:</span>
                  <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{totalTokens.toLocaleString()}</span>
                </div>
              </div>
            )}
            {(currentSession?.toolCallsCount ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400">Tool Calls:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">{currentSession?.toolCallsCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            )}
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Using {models.find((m) => m.id === selectedModel)?.name || selectedModel}
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenRouter API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get your free API key at{" "}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    openrouter.ai/keys
                  </a>
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Sidebar */}
      {showHistory && (
        <ChatHistorySidebar
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onNewChat={handleNewChat}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ChatHistoryProvider>
      <ChatPageContent />
    </ChatHistoryProvider>
  );
}