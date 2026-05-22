/**
 * AI Chat Feature - AI Code Assistant Component
 * 
 * An AI assistant that can help with code editing tasks using the AI MCP.
 * Integrates with the chat system and provides code-specific functionality.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message, Usage } from "../types";
import { FREE_MODELS, DEFAULT_MODEL } from "../lib/models";
import { getChatEndpoint } from "../lib/microservice-config";
import { scanWorkspace, ScanSummary } from "../lib/workspace-scanner";

interface CodeEditorContext {
  filePath: string;
  language: string;
  content: string;
  selection: {
    start: number;
    end: number;
    text: string;
  } | null;
}

interface WorkspaceContext {
  rootFolder?: {
    name: string;
    children?: any[];
    content?: string;
    language?: string;
    path: string;
    type: 'file' | 'folder';
    extension?: string;
  };
}

interface AIAssistantProps {
  editorContext: CodeEditorContext;
  workspaceContext?: WorkspaceContext;
  onApplyChanges: (newContent: string) => void;
  apiKey: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

interface AssistantAction {
  type: "edit" | "explain" | "refactor" | "fix" | "optimize" | "scan";
  description: string;
}

const ACTIONS: AssistantAction[] = [
  { type: "scan", description: "Scan workspace for issues" },
  { type: "explain", description: "Explain the selected code" },
  { type: "refactor", description: "Refactor for better readability" },
  { type: "fix", description: "Fix bugs or issues" },
  { type: "optimize", description: "Optimize for performance" },
  { type: "edit", description: "Make custom edit" },
];

export default function AIAssistant({ editorContext, workspaceContext, onApplyChanges, apiKey, selectedModel = DEFAULT_MODEL, onModelChange }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(selectedModel);
  const [modelStatus, setModelStatus] = useState("Ready");
  const [tokenUsage, setTokenUsage] = useState<Usage | null>(null);
  const [scanResults, setScanResults] = useState<ScanSummary | null>(null);
  const [showScanResults, setShowScanResults] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm your AI coding assistant. I can help explain, refactor, fix, or optimize your code. I can also scan your workspace for issues. What would you like me to do?" }
  ]);
  const [activeAction, setActiveAction] = useState<AssistantAction | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use FREE_MODELS directly instead of useState
  const models = FREE_MODELS;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle model change
  const handleModelChange = (newModel: string) => {
    setCurrentModel(newModel);
    onModelChange?.(newModel);
  };

  // Helper to build workspace context for prompts
  const getWorkspaceSummary = () => {
    if (!workspaceContext?.rootFolder) return "No workspace context available.";
    const files: string[] = [];
    const scanFolder = (folder: any, path: string = folder.path || "/") => {
      if (folder.children) {
        folder.children.forEach((child: any) => {
          if (child.type === 'folder') {
            scanFolder(child, path.endsWith('/') ? `${path}${child.path}` : `${path}/${child.path}`);
          } else {
            files.push(path.endsWith('/') ? `${path}${child.path}` : `${path}/${child.path}`);
          }
        });
      }
    };
    scanFolder(workspaceContext.rootFolder);
    return `Workspace contains ${files.length} files:\n${files.slice(0, 10).join('\n')}${files.length > 10 ? '\n...' : ''}`;
  };

  // Handle workspace scan
  const handleWorkspaceScan = () => {
    if (!workspaceContext?.rootFolder) {
      setModelStatus("No workspace to scan");
      return;
    }
    
    setModelStatus("Scanning workspace...");
    const results = scanWorkspace(workspaceContext.rootFolder);
    setScanResults(results);
    setShowScanResults(true);
    setModelStatus(`Found ${results.totalIssues} issues in ${results.totalFiles} files`);
  };

  const handleAction = async (action: AssistantAction) => {
    setActiveAction(action);
    setInput("");
    
    // Update status
    setModelStatus(`Using ${models.find(m => m.id === currentModel)?.name || currentModel}...`);
    setTokenUsage(null);
    
    let userMessage: string;
    
    if (action.type === "scan") {
      userMessage = `Scan the workspace for potential issues, bugs, or improvements. Context:\n${getWorkspaceSummary()}`;
    } else if (action.type === "edit") {
      userMessage = `Please make the following change to the code:\n\n${input}`;
    } else {
      userMessage = `${action.description} for the following ${editorContext.language} code:\n\n${editorContext.selection?.text || editorContext.content}`;
    }
    
    const userMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(userMessages);
    setIsLoading(true);

    try {
      const response = await fetch(getChatEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: userMessages,
          model: currentModel,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let promptTokens = 0;
      let completionTokens = 0;

      const assistantMessages: Message[] = [...userMessages, { role: "assistant", content: "" }];
      setMessages(assistantMessages);

      // Set loading status
      setModelStatus(`Processing with ${models.find(m => m.id === currentModel)?.name || currentModel}...`);

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
              
              // Extract token usage if present
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens || 0;
                completionTokens = parsed.usage.completion_tokens || 0;
                setTokenUsage({
                  promptTokens,
                  completionTokens,
                  totalTokens: promptTokens + completionTokens
                });
              }
              
              const updatedMessages: Message[] = [
                ...userMessages,
                { role: "assistant", content: assistantMessage }
              ];
              setMessages(updatedMessages);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Update final status
      setModelStatus(`${models.find(m => m.id === currentModel)?.name || currentModel} - Ready`);

      // If action is edit, try to apply changes
      if (action.type === "edit" && assistantMessage.includes("```")) {
        const codeMatch = assistantMessage.match(/```[\w]*\n([\s\S]*?)```/);
        if (codeMatch) {
          onApplyChanges(codeMatch[1]);
        }
      }
    } catch (error: any) {
      const errorMessages: Message[] = [...userMessages, { role: "assistant", content: `Error: ${error?.message || "Something went wrong"}` }];
      setMessages(errorMessages);
      setModelStatus("Error occurred");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">AI Assistant</h3>
          <select
            value={currentModel}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={isLoading}
            className="text-xs bg-gray-700 text-gray-200 rounded px-1 py-0.5"
          >
            {models.slice(0, 5).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500">{editorContext.filePath}</p>
        <p className="text-xs text-blue-400 mt-1">{modelStatus}</p>
        {tokenUsage && (
          <p className="text-xs text-gray-400 mt-1">
            Tokens: {tokenUsage.promptTokens} prompt + {tokenUsage.completionTokens} completion = {tokenUsage.totalTokens} total
          </p>
        )}
      </div>

      {/* Scan Results Panel */}
      {showScanResults && scanResults && (
        <div className="p-3 border-b border-gray-700 bg-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-yellow-400">Workspace Scan Results</h4>
            <button 
              onClick={() => setShowScanResults(false)}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Hide
            </button>
          </div>
          <div className="text-xs space-y-1">
            <p>Files scanned: <span className="text-blue-300">{scanResults.totalFiles}</span></p>
            <p>Errors: <span className="text-red-300">{scanResults.errors}</span></p>
            <p>Warnings: <span className="text-yellow-300">{scanResults.warnings}</span></p>
            <p>Suggestions: <span className="text-green-300">{scanResults.suggestions}</span></p>
          </div>
          {scanResults.results.some(r => r.issues.length > 0) && (
            <div className="mt-2 max-h-32 overflow-y-auto">
              {scanResults.results.filter(r => r.issues.length > 0).slice(0, 3).map((result, idx) => (
                <div key={idx} className="text-xs mb-1">
                  <p className="text-gray-400">{result.file}</p>
                  {result.issues.slice(0, 2).map((issue, issueIdx) => (
                    <p key={issueIdx} className={`ml-2 ${issue.type === 'error' ? 'text-red-300' : issue.type === 'warning' ? 'text-yellow-300' : 'text-green-300'}`}>
                      {issue.message}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
              message.role === "user" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-800 text-gray-300 border border-gray-700"
            }`}>
              <pre className="whitespace-pre-wrap font-mono">{message.content}</pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-1 mb-2">
          {ACTIONS.slice(0, 6).map((action) => {
            // Scan action doesn't require selection
            const requiresSelection = action.type !== "scan" && action.type !== "edit";
            return (
              <button
                key={action.type}
                onClick={() => action.type === "scan" ? handleWorkspaceScan() : handleAction(action)}
                disabled={isLoading || (requiresSelection && !editorContext.selection?.text)}
                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
                title={action.description}
              >
                {action.description.split(' ')[0]}
              </button>
            );
          })}
        </div>
        
        {/* Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading) {
              handleAction({ type: "edit", description: "Custom edit" });
            }
          }}
          className="flex gap-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the change you want..."
            disabled={isLoading}
            className="flex-1 px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? "..." : "Go"}
          </button>
        </form>
      </div>
    </div>
  );
}