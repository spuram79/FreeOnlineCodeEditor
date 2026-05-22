/**
 * CodeOnline Feature - Status Bar Component
 * 
 * VSCode-like status bar showing position, encoding, and other info.
 */

"use client";

import React from "react";
import { EditorTab, EditorPosition } from "../types";

interface StatusBarProps {
  activeTab?: EditorTab;
  position?: EditorPosition;
  terminalVisible: boolean;
  onToggleTerminal: () => void;
}

export default function StatusBar({ 
  activeTab, 
  position = { lineNumber: 1, column: 1 }, 
  terminalVisible, 
  onToggleTerminal 
}: StatusBarProps) {
  return (
    <div className="h-6 bg-blue-600 flex items-center justify-between px-2 text-xs text-white">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-blue-700 px-2 py-0.5 rounded">
          <span className="font-semibold">CodeOnline</span>
        </button>
        
        {activeTab && (
          <>
            <span className="text-blue-200">
              {activeTab.language.toUpperCase()}
            </span>
            <span className="text-blue-200">
              {activeTab.isDirty ? "● Unsaved" : "Saved"}
            </span>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <span className="text-blue-200">
          Ln {position.lineNumber}, Col {position.column}
        </span>
        <span className="text-blue-200">UTF-8</span>
        <span className="text-blue-200">{activeTab?.name || "No file"}</span>
        
        <button
          onClick={onToggleTerminal}
          className={`hover:bg-blue-700 px-2 py-0.5 rounded ${terminalVisible ? "bg-blue-700" : ""}`}
        >
          <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 7h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1" />
          </svg>
          Terminal
        </button>
      </div>
    </div>
  );
}