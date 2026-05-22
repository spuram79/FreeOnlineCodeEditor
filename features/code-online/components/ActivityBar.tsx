/**
 * CodeOnline Feature - Activity Bar Component
 * 
 * VSCode-like activity bar for switching between views.
 */

"use client";

import React from "react";
import { ActivityView } from "../types";

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
}

const activityItems: { id: ActivityView; label: string; icon: React.ReactNode }[] = [
  {
    id: "explorer",
    label: "Explorer",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h5l2 2h6a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    id: "search",
    label: "Search",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: "git",
    label: "Source Control",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 7h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1" />
      </svg>
    ),
  },
  {
    id: "debug",
    label: "Debug",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "run",
    label: "Run",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.75A1 1 0 007 8.75v6.5a1 1 0 001.23.97l6.518-3.75a1 1 0 000-1.764z" />
      </svg>
    ),
  },
];

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  return (
    <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-2 gap-2">
      {activityItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`p-2 rounded hover:bg-gray-700 relative group ${
            activeView === item.id ? "text-blue-400" : "text-gray-400"
          }`}
          title={item.label}
        >
          {item.icon}
          {activeView === item.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 rounded-r" />
          )}
          {/* Tooltip */}
          <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}