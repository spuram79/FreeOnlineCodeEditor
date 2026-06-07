/**
 * AI Chat Feature - Message Bubble Component
 * 
 * Displays individual chat messages with Perplexity-like styling.
 * Supports sources/citations and follow-up questions.
 */

"use client";

import { Message, Source } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const sources = message.sources || [];
  const followUpQuestions = message.followUpQuestions || [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-blue-500" : "bg-gradient-to-br from-blue-500 to-purple-600"
        }`}>
          <span className="text-white text-sm font-medium">
            {isUser ? "U" : "AI"}
          </span>
        </div>
        <div className={`flex flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
          }`}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          </div>
          
          {/* Sources/Citations - Perplexity-style */}
          {!isUser && sources.length > 0 && (
            <div className="w-full mt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Sources:</p>
              <div className="flex flex-col gap-2">
                {sources.map((source, idx) => (
                  <SourceLink key={source.id} source={source} index={idx + 1} />
                ))}
              </div>
            </div>
          )}
          
          {/* Follow-up Questions - Perplexity-style */}
          {!isUser && followUpQuestions.length > 0 && (
            <div className="w-full mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Related questions:</p>
              <div className="flex flex-col gap-1.5">
                {followUpQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="text-left text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceLink({ source, index }: { source: Source; index: number }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-2 group"
    >
      <span className="flex-shrink-0 w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {source.title}
        </p>
        {source.snippet && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {source.snippet}
          </p>
        )}
      </div>
    </a>
  );
}