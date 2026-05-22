/**
 * CodeOnline Feature - CodeOnline Component
 * 
 * Main VSCode-like online code editor component.
 */

"use client";

import React, { useState, useCallback } from "react";
import { CodeOnlineState, ActivityView, FileInfo, EditorTab, Terminal } from "../types";
import FileExplorer from "./FileExplorer";
import EditorTabs from "./EditorTabs";
import TerminalPanel from "./TerminalPanel";
import StatusBar from "./StatusBar";
import ActivityBar from "./ActivityBar";
import GitPanel from "./GitPanel";
import CodeEditor from "../../code-editor/components/CodeEditor";
import { Language } from "../../code-editor/types";
import { getGitService } from "../lib/git-service";

export default function CodeOnline() {
  const gitService = getGitService();
  
  const [state, setState] = useState<CodeOnlineState>({
    expandedFolders: new Set(["root"]),
    tabs: [],
    terminals: [{
      id: "terminal-1",
      name: "Terminal 1",
      lines: [{ id: "1", content: "Welcome to CodeOnline Terminal", type: "output", timestamp: new Date() }],
      isActive: true,
    }],
    activeTerminalId: "terminal-1",
    isTerminalVisible: true,
    activeView: "explorer",
    fontSize: 14,
    fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
    theme: "dark",
    wordWrap: true,
    minimap: false,
  });

  // Sample file structure
  const [rootFolder] = useState<FileInfo>({
    id: "root",
    name: "workspace",
    path: "/",
    type: "folder",
    extension: "",
    children: [
      {
        id: "src",
        name: "src",
        path: "/src",
        type: "folder",
        extension: "",
        children: [
          { id: "index", name: "index.js", path: "/src/index.js", type: "file", extension: "js", language: "javascript", content: "// Main entry point\nconsole.log('Hello, World!');" },
          { id: "app", name: "app.js", path: "/src/app.js", type: "file", extension: "js", language: "javascript", content: "// Application logic\nfunction App() {\n  return <div>Hello</div>;\n}" },
        ],
      },
      {
        id: "styles",
        name: "styles",
        path: "/styles",
        type: "folder",
        extension: "",
        children: [
          { id: "main", name: "main.css", path: "/styles/main.css", type: "file", extension: "css", language: "css", content: "/* Main styles */\nbody { margin: 0; }" },
        ],
      },
      { id: "readme", name: "README.md", path: "/README.md", type: "file", extension: "md", language: "markdown", content: "# My Project" },
      { id: "package", name: "package.json", path: "/package.json", type: "file", extension: "json", language: "json", content: '{ "name": "my-project" }' },
    ],
  });

  const handleFileSelect = useCallback((file: FileInfo) => {
    if (file.type === "file") {
      const existingTabIndex = state.tabs.findIndex(t => t.path === file.path);
      
      if (existingTabIndex >= 0) {
        setState(prev => ({
          ...prev,
          tabs: prev.tabs.map((tab, i) => ({
            ...tab,
            isActive: i === existingTabIndex,
          })),
          activeTabId: state.tabs[existingTabIndex].id,
        }));
      } else {
        const newTab: EditorTab = {
          id: `tab-${Date.now()}`,
          name: file.name,
          path: file.path,
          content: file.content || "",
          language: file.language || "plaintext",
          isDirty: false,
          isActive: true,
        };
        
        setState(prev => ({
          ...prev,
          tabs: [...prev.tabs.map(t => ({ ...t, isActive: false })), newTab],
          activeTabId: newTab.id,
        }));
      }
    }
  }, [state.tabs]);

  const handleTabContentChange = useCallback((tabId: string, content: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab => 
        tab.id === tabId ? { ...tab, content, isDirty: true } : tab
      ),
    }));
  }, []);

  const handleTabClose = useCallback((tabId: string) => {
    setState(prev => {
      const tabIndex = prev.tabs.findIndex(t => t.id === tabId);
      const newTabs = prev.tabs.filter(t => t.id !== tabId);
      
      let newActiveTabId = prev.activeTabId;
      if (tabId === prev.activeTabId && newTabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
        newTabs[newActiveIndex].isActive = true;
        newActiveTabId = newTabs[newActiveIndex].id;
      }
      
      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  }, []);

  const handleActivityChange = useCallback((view: ActivityView) => {
    setState(prev => ({ ...prev, activeView: view }));
  }, []);

  const handleTerminalCommand = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      terminals: prev.terminals.map(term => 
        term.isActive 
          ? {
              ...term,
              lines: [
                ...term.lines,
                { id: Date.now().toString(), content: `$ ${command}`, type: "input", timestamp: new Date() },
                { id: (Date.now() + 1).toString(), content: `Executed: ${command}`, type: "output", timestamp: new Date() },
              ],
            }
          : term
      ),
    }));
  }, []);

  const activeTab = state.tabs.find(t => t.id === state.activeTabId);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Title Bar */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <span className="text-sm font-semibold">CodeOnline - Visual Studio Code</span>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar 
          activeView={state.activeView} 
          onViewChange={handleActivityChange} 
        />

        {/* Side Bar (File Explorer, Search, Git, etc.) */}
        {(state.activeView === "explorer" || state.activeView === "search" || state.activeView === "git") && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-2 text-xs font-semibold text-gray-400 uppercase">
              {state.activeView}
            </div>
            {state.activeView === "explorer" && (
              <FileExplorer 
                rootFolder={rootFolder} 
                onFileSelect={handleFileSelect}
                expandedFolders={state.expandedFolders}
              />
            )}
            {state.activeView === "git" && (
              <GitPanel gitService={gitService} />
            )}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          {state.tabs.length > 0 && (
            <EditorTabs 
              tabs={state.tabs} 
              activeTabId={state.activeTabId}
              onTabSelect={(tabId) => setState(prev => ({
                ...prev,
                tabs: prev.tabs.map(t => ({ ...t, isActive: t.id === tabId })),
                activeTabId: tabId,
              }))}
              onTabClose={handleTabClose}
            />
          )}

          {/* Editor */}
          <div className="flex-1 relative">
            {activeTab ? (
              <CodeEditor
                language={activeTab.language as Language}
                value={activeTab.content}
                onChange={(val) => handleTabContentChange(activeTab.id, val)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p>Select a file to begin editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Panel */}
          {state.isTerminalVisible && (
            <TerminalPanel 
              terminals={state.terminals}
              activeTerminalId={state.activeTerminalId}
              onCommand={handleTerminalCommand}
              onClose={() => setState(prev => ({ ...prev, isTerminalVisible: false }))}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar 
        activeTab={activeTab}
        position={{ lineNumber: 1, column: 1 }}
        terminalVisible={state.isTerminalVisible}
        onToggleTerminal={() => setState(prev => ({ ...prev, isTerminalVisible: !prev.isTerminalVisible }))}
      />
    </div>
  );
}