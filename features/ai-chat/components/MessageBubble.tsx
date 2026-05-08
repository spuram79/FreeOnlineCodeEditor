/**
 * AI Chat Feature - Message Bubble Component
 * 
 * Displays individual chat messages with proper styling.
 * Can be moved to a separate project by copying this file.
 */

"use client";

import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
        </div>
      </div>
    </div>
  );
}