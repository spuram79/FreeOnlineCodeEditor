/**
 * AI Chat Feature - Message Bubble Component
 * 
 * Displays individual chat messages with proper styling.
 * Can be moved to a separate project by copying this file.
 */

"use client";

import { useState } from "react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-500" : "bg-purple-500"
        }`}>
          <span className="text-white text-sm font-medium">
            {isUser ? "U" : "AI"}
          </span>
        </div>
        <div className={`px-4 py-3 rounded-lg ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
        }`}>
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`mt-2 text-xs ${
              isUser ? "text-blue-100 hover:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            } ${copied ? "opacity-50" : ""}`}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          
          {/* Tool Calls Display */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {message.toolCalls.map((tool, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{tool.function.name}</span>
                    <pre className="text-xs mt-1 overflow-x-auto">{tool.function.arguments}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Usage Stats */}
          {message.usage && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Prompt: {message.usage.promptTokens}</span>
                <span>Completion: {message.usage.completionTokens}</span>
                <span>Total: {message.usage.totalTokens}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}