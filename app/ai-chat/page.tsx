"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Model, Source, FocusMode, FREE_MODELS, FOCUS_MODES, ChatHistoryProvider, useChatHistory, ChatHistorySidebar, MessageBubble } from "@/features/ai-chat";

function ChatPageContent() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models] = useState<Model[]>(FREE_MODELS);
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFocusMode, setSelectedFocusMode] = useState<FocusMode | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentSession, createNewSession, updateSession, selectSession, updateSessionFocusMode, deleteAllSessions } = useChatHistory();
  const messages = currentSession?.messages || [];
  const sessionId = currentSession?.id;

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
      handleNewChat();
    }
  }, [currentSession]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
  };

  const handleNewChat = async () => {
    if (currentSession) {
      // Save current session before creating new one
      await updateSession(currentSession.id, currentSession.messages, selectedModel);
    }
    await createNewSession(selectedModel, selectedFocusMode);
  };

  const handleFocusModeChange = (mode: FocusMode | undefined) => {
    setSelectedFocusMode(mode);
    if (sessionId) {
      updateSessionFocusMode(sessionId, mode);
    }
  };

  const handleDeleteAllSessions = async () => {
    if (confirm('Delete all conversations? This cannot be undone.')) {
      await deleteAllSessions();
    }
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
    } catch (error: any) {
      if (error.name !== "AbortError") {
        const errorMessages: Message[] = [...userMessages, { role: "assistant", content: `Error: ${error.message || "Something went wrong"}` }];
        updateSession(sessionId!, errorMessages, selectedModel);
      }
    } finally {
      setIsLoading(false);
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
                <div className={`px-4 py-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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