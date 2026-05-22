/**
 * CodeOnline Feature - Run Panel Component
 * 
 * Panel for configuring and running projects.
 */

"use client";

import React, { useState } from "react";
import { RunConfiguration, RunResult, RunEnvironment } from "../types";

interface RunPanelProps {
  configurations: RunConfiguration[];
  onRun: (config: RunConfiguration) => void;
  onStop: (runId: string) => void;
  activeRuns: RunResult[];
}

const getEnvironmentIcon = (type: RunEnvironment) => {
  const icons: Record<RunEnvironment, React.ReactNode> = {
    node: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    python: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    browser: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 0l7-7m-7 7l7 7" /></svg>,
    custom: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.35 0z" /></svg>,
  };
  return icons[type];
};

export default function RunPanel({ configurations, onRun, onStop, activeRuns }: RunPanelProps) {
  const [showNewConfig, setShowNewConfig] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<RunConfiguration>>({
    name: "",
    type: "node",
    command: "node",
    workingDirectory: "./",
  });

  const handleRun = (config: RunConfiguration) => {
    onRun(config);
  };

  const handleStop = (runId: string) => {
    onStop(runId);
  };

  const handleCreateConfig = () => {
    // Validate required fields
    if (!newConfig.name?.trim()) {
      alert("Configuration name is required");
      return;
    }
    if (!newConfig.command?.trim()) {
      alert("Command is required");
      return;
    }
    
    const config: RunConfiguration = {
      id: `config-${Date.now()}`,
      name: newConfig.name.trim(),
      type: newConfig.type || "custom",
      command: newConfig.command.trim(),
      workingDirectory: newConfig.workingDirectory?.trim() || "./",
      env: newConfig.env,
      args: newConfig.args,
      apiKey: newConfig.apiKey,
    };
    onRun(config);
    setShowNewConfig(false);
    setNewConfig({ name: "", type: "node", command: "node", workingDirectory: "./" });
  };

  const activeRunIds = new Set(activeRuns.map(r => r.configurationId));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase">Run Configurations</h3>
          <button
            onClick={() => setShowNewConfig(true)}
            className="text-xs text-blue-400 hover:text-blue-300"
            title="Add configuration"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Configurations List */}
      <div className="flex-1 overflow-y-auto">
        {configurations.length === 0 ? (
          <div className="p-4 text-xs text-gray-500">
            <p>No run configurations</p>
            <p className="mt-1">Click + to add one</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {configurations.map((config) => {
              const isRunning = activeRunIds.has(config.id);
              return (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-gray-400">{getEnvironmentIcon(config.type)}</div>
                    <span className="text-xs text-gray-300">{config.name}</span>
                    {isRunning && (
                      <span className="text-xs text-yellow-400 animate-pulse">●</span>
                    )}
                  </div>
                  <button
                    onClick={() => isRunning ? handleStop(config.id) : handleRun(config)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      isRunning 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isRunning ? "Stop" : "Run"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Runs Output */}
      {activeRuns.length > 0 && (
        <div className="border-t border-gray-700 max-h-48 overflow-y-auto">
          <div className="p-2">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Running</h4>
            {activeRuns.map((run) => (
              <div key={run.id} className="text-xs">
                <div className="text-gray-400 mb-1">
                  Output ({run.status}):
                </div>
                <pre className="bg-gray-900 p-2 rounded text-gray-300 text-[10px] overflow-x-auto">
                  {run.output || "Waiting..."}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Config Modal */}
      {showNewConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-80 p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">New Configuration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={newConfig.name || ""}
                  onChange={(e) => setNewConfig({ ...newConfig, name: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                  placeholder="My App"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={newConfig.type || "node"}
                  onChange={(e) => setNewConfig({ ...newConfig, type: e.target.value as RunEnvironment })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                >
                  <option value="node">Node.js</option>
                  <option value="python">Python</option>
                  <option value="browser">Browser</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Command *</label>
                <input
                  type="text"
                  value={newConfig.command || ""}
                  onChange={(e) => setNewConfig({ ...newConfig, command: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                  placeholder="npm start"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Working Directory</label>
                <input
                  type="text"
                  value={newConfig.workingDirectory || "./"}
                  onChange={(e) => setNewConfig({ ...newConfig, workingDirectory: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                  placeholder="./"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">OpenRouter API Key (optional)</label>
                <input
                  type="password"
                  value={newConfig.apiKey?.openrouter || ""}
                  onChange={(e) => setNewConfig({ 
                    ...newConfig, 
                    apiKey: { ...newConfig.apiKey, openrouter: e.target.value } 
                  })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded"
                  placeholder="sk-or-..."
                />
                <p className="text-[10px] text-gray-500 mt-1">Used by AI Assistant. Get at openrouter.ai</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateConfig}
                className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newConfig.name?.trim() || !newConfig.command?.trim()}
              >
                Create
              </button>
              <button
                onClick={() => setShowNewConfig(false)}
                className="flex-1 px-3 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}