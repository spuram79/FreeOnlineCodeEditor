/**
 * CodeOnline Feature - Terminal Panel Component
 * 
 * VSCode-like terminal panel with command input.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, TerminalLine } from "../types";

interface TerminalPanelProps {
  terminals: Terminal[];
  activeTerminalId?: string;
  onCommand: (command: string) => void;
  onClose: () => void;
}

const getLineClassName = (type: TerminalLine["type"]) => {
  const classes = {
    input: "text-green-400",
    output: "text-gray-300",
    error: "text-red-400",
    success: "text-green-400",
  };
  return classes[type];
};

export default function TerminalPanel({ terminals, activeTerminalId, onCommand, onClose }: TerminalPanelProps) {
  const [input, setInput] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTerminal?.lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input);
      setInput("");
    }
  };

  if (!activeTerminal) return null;

  return (
    <div className="h-64 bg-gray-950 border-t border-gray-700 flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">TERMINAL</span>
          {terminals.map((t) => (
            <button
              key={t.id}
              className={`text-xs px-2 py-0.5 rounded ${
                t.id === activeTerminalId ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Terminal Output */}
      <div ref={terminalRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {activeTerminal.lines.map((line) => (
          <div key={line.id} className={getLineClassName(line.type)}>
            {line.content}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 border-t border-gray-700">
        <span className="text-green-400 font-mono">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-white font-mono text-xs outline-none"
          placeholder="Type a command..."
          autoFocus
        />
      </form>
    </div>
  );
}