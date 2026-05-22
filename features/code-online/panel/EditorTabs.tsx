/**
 * CodeOnline Feature - Editor Tabs Component
 * 
 * VSCode-like tabbed interface for multiple open files.
 */

"use client";

import React from "react";
import { EditorTab } from "../types/index";

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId?: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    javascript: "bg-yellow-400",
    typescript: "bg-blue-400",
    jsx: "bg-blue-400",
    tsx: "bg-blue-400",
    css: "bg-blue-500",
    json: "bg-yellow-300",
    markdown: "bg-white",
    html: "bg-orange-400",
    python: "bg-green-400",
    java: "bg-red-400",
    csharp: "bg-purple-400",
  };
  return colors[language] || "bg-gray-400";
};

export default function EditorTabs({ tabs, activeTabId, onTabSelect, onTabClose }: EditorTabsProps) {
  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer min-w-[120px] max-w-[200px] group ${
            tab.id === activeTabId ? "bg-gray-900 border-t-2 border-t-blue-500" : "hover:bg-gray-750"
          }`}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className={`w-2 h-2 rounded-full ${getLanguageColor(tab.language)}`} />
          <span className="text-sm text-gray-300 truncate flex-1">{tab.name}</span>
          {tab.isDirty && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
          <button
            className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}