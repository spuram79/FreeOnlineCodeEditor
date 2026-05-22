/**
 * CodeOnline Feature - File Explorer Component
 * 
 * VSCode-like file explorer with tree view.
 */

"use client";

import React, { useState } from "react";
import { FileInfo } from "../types/index";

interface FileExplorerProps {
  rootFolder: FileInfo;
  onFileSelect: (file: FileInfo) => void;
  expandedFolders: Set<string>;
}

const getFileIcon = (file: FileInfo) => {
  if (file.type === "folder") {
    return (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h5l2 2h6a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    );
  }

  const iconMap: Record<string, React.ReactNode> = {
    js: <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    ts: <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    tsx: <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    jsx: <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    css: <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
    json: <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>,
    md: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    html: <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    py: <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  };

  return iconMap[file.extension] || <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
};

const TreeNode: React.FC<{
  node: FileInfo;
  level: number;
  onFileSelect: (file: FileInfo) => void;
  expandedFolders: Set<string>;
}> = ({ node, level, onFileSelect, expandedFolders }) => {
  const [isExpanded, setIsExpanded] = useState(expandedFolders.has(node.id));

  if (node.type === "folder") {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div>
        <div
          className="flex items-center gap-1 py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm"
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {getFileIcon(node)}
          <span className="text-gray-200">{node.name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm"
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onFileSelect(node)}
    >
      {getFileIcon(node)}
      <span className="text-gray-300">{node.name}</span>
    </div>
  );
};

export default function FileExplorer({ rootFolder, onFileSelect, expandedFolders }: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto">
      <TreeNode
        node={rootFolder}
        level={0}
        onFileSelect={onFileSelect}
        expandedFolders={expandedFolders}
      />
    </div>
  );
}