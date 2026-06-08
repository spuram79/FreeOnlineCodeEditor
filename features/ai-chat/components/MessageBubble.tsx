/**
 * AI Chat Feature - Message Bubble Component
 * 
 * Displays individual chat messages with Claude/Perplexity-like styling.
 * Supports markdown rendering, sources/citations, and follow-up questions.
 * Now includes copy/download functionality for AI responses.
 */

"use client";

import { Message, Source } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  onFollowUpClick?: (question: string) => void;
}

export default function MessageBubble({ message, onFollowUpClick }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const sources = message.sources || [];
  const followUpQuestions = message.followUpQuestions || [];
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsFile = (format: 'text' | 'markdown' = 'text') => {
    let content: string;
    let filename: string;
    let mimeType: string;
    
    const timestamp = new Date().toISOString();
    
    if (format === 'markdown') {
      content = `## AI Response\n\n${message.content}`;
      filename = `ai-response_${timestamp.slice(0, 10)}.md`;
      mimeType = 'text/markdown';
    } else {
      content = message.content;
      filename = `ai-response_${timestamp.slice(0, 10)}.txt`;
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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
              : "bg-white dark:bg-gray-850 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm"
          }`}>
            <div className="text-sm leading-relaxed">
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
          
          {/* Action buttons for AI responses */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <rect x="3" y="3" width="13" height="13" rx="2" ry="2" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={() => downloadAsFile('text')}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download as text"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l3-3m-3 3l-3-3M4 18h16" />
                </svg>
                <span>TXT</span>
              </button>
              <button
                onClick={() => downloadAsFile('markdown')}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download as markdown"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l3-3m-3 3l-3-3M4 18h16" />
                </svg>
                <span>MD</span>
              </button>
            </div>
          )}
          
          {/* Sources/Citations - Perplexity-style */}
          {!isUser && sources.length > 0 && (
            <div className="w-full mt-2 space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sources:</p>
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <SourceLink key={source.id} source={source} index={idx + 1} />
                ))}
              </div>
            </div>
          )}
          
          {/* Follow-up Questions - Perplexity-style */}
          {!isUser && followUpQuestions.length > 0 && (
            <div className="w-full mt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Related questions:</p>
              <div className="flex flex-wrap gap-2">
                {followUpQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFollowUpClick?.(question)}
                    className="px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
    >
      <span className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {source.title}
        </p>
        {source.snippet && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {source.snippet}
          </p>
        )}
      </div>
    </a>
  );
}