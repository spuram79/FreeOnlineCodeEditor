/**
 * AI Chat Feature - AI Code Assistant Component
 * 
 * An AI assistant that can help with code editing tasks using the AI MCP.
 * Integrates with the chat system and provides code-specific functionality.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { FREE_MODELS } from "../lib/models";
import { getChatEndpoint } from "../lib/microservice-config";

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

export default function AIAssistant({ editorContext, workspaceContext, onApplyChanges, apiKey, selectedModel = "openrouter/free", onModelChange }: AIAssistantProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  // Helper to build workspace context for prompts
  const getWorkspaceSummary = () => {
    if (!workspaceContext?.rootFolder) return "No workspace context available.";
    const files: string[] = [];
    const scanFolder = (folder: any, path: string = "") => {
      if (folder.children) {
        folder.children.forEach((child: any) => {
          if (child.type === 'folder') {
            scanFolder(child, `${path}/${child.path}`);
          } else {
            files.push(`${path}/${child.path}`);
          }
        });
      }
    };
    scanFolder(workspaceContext.rootFolder);
    return `Workspace contains ${files.length} files:\n${files.slice(0, 10).join('\n')}${files.length > 10 ? '\n...' : ''}`;
  };

  const handleAction = async (action: AssistantAction) => {
    setActiveAction(action);
    setInput("");
    
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
          model: selectedModel,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      const assistantMessages: Message[] = [...userMessages, { role: "assistant", content: "" }];
      setMessages(assistantMessages);

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
              setMessages(updatedMessages);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

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
            value={selectedModel}
            onChange={(e) => onModelChange?.(e.target.value)}
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
      </div>

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
                onClick={() => handleAction(action)}
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