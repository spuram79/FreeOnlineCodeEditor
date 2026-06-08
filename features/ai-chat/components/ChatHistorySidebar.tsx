/**
 * AI Chat Feature - Chat History Sidebar
 * 
 * Sidebar component for viewing and managing chat history.
 * Similar to Claude's conversation sidebar.
 */

"use client";

import { useChatHistory } from "../lib/chat-history-context";
import { useState } from "react";
import { Message } from "../types";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  onNewChat,
}: ChatHistorySidebarProps) {
  const { sessions, selectSession, deleteSession, currentSession, deleteAllSessions } = useChatHistory();
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const handleSelectSession = (id: string) => {
    selectSession(id);
    onClose();
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      await deleteSession(id);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Delete ALL conversations? This cannot be undone.")) {
      await deleteAllSessions();
      setShowDeleteAllConfirm(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const exportConversation = (session: { id: string; title: string; messages: Message[]; updatedAt: number }, format: 'text' | 'markdown' | 'json') => {
    const timestamp = new Date(session.updatedAt).toISOString();
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    const title = session.title || "conversation";
    
    switch (format) {
      case 'text':
        content = session.messages.map(msg => 
          `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
        ).join('\n\n');
        filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp.slice(0, 10)}.txt`;
        mimeType = 'text/plain';
        break;
      case 'markdown':
        content = session.messages.map(msg => 
          `## ${msg.role === 'user' ? 'You' : 'AI'}\n\n${msg.content}`
        ).join('\n\n---\n\n');
        filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp.slice(0, 10)}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify({
          title: session.title,
          createdAt: timestamp,
          messages: session.messages
        }, null, 2);
        filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp.slice(0, 10)}.json`;
        mimeType = 'application/json';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCurrentConversation = () => {
    if (!currentSession) return;
    const exportModal = document.createElement('div');
    exportModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    exportModal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Conversation</h3>
        <div class="space-y-2">
          <button data-format="text" class="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Export as Text (.txt)</button>
          <button data-format="markdown" class="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Export as Markdown (.md)</button>
          <button data-format="json" class="w-full px-4 py-2 text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Export as JSON (.json)</button>
        </div>
        <button class="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancel</button>
      </div>
    `;
    document.body.appendChild(exportModal);
    
    exportModal.querySelector('button:last-of-type')?.addEventListener('click', () => {
      document.body.removeChild(exportModal);
    });
    
    exportModal.querySelectorAll('button[data-format]').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = (btn as HTMLButtonElement).dataset.format as 'text' | 'markdown' | 'json';
        exportConversation(currentSession, format);
        document.body.removeChild(exportModal);
      });
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h2>
            <div className="flex items-center gap-2">
              {currentSession && (
                <button
                  onClick={exportCurrentConversation}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Export conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-1.64-9.642 4.002 4.002 0 00-.64 6.642" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v8m0 0l3-3m-3 3l-3-3" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start chatting to save history</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(session.updatedAt)} • {session.messages.length} messages
                      </p>
                    </div>
                    {hoveredSession === session.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportConversation(session, 'text');
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          title="Export as text"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-1.64-9.642 4.002 4.002 0 00-.64 6.642" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded"
                          title="Delete conversation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete All Button */}
          {sessions.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Delete All Conversations
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete All Conversations?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This will permanently delete all your chat conversations. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-md"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}