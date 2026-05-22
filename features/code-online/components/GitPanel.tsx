/**
 * CodeOnline Feature - Git Panel Component
 * 
 * VSCode-like Git sidebar panel for repository operations.
 */

"use client";

import React, { useState } from "react";
import { GitRepository, GitCommit, GitFileChange, GitBranch } from "../types";
import { GitService, getGitService } from "../lib/git-service";

interface GitPanelProps {
  gitService: GitService;
  onRepositoryChange?: (repo: GitRepository | undefined) => void;
}

export default function GitPanel({ gitService, onRepositoryChange }: GitPanelProps) {
  const [repository, setRepository] = useState<GitRepository | undefined>();
  const [cloneUrl, setCloneUrl] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [changes, setChanges] = useState<GitFileChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClone = async () => {
    if (!cloneUrl.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const repo = await gitService.cloneRepository({ url: cloneUrl });
      setRepository(repo);
      const fetchedBranches = await gitService.fetchBranches();
      setBranches(fetchedBranches);
      onRepositoryChange?.(repo);
      setCloneUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone repository");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    setIsLoading(true);
    
    try {
      const commit = await gitService.commitChanges({ message: commitMessage });
      setCommitMessage("");
      // Refresh changes
      setChanges([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to commit");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async () => {
    setIsLoading(true);
    
    try {
      await gitService.pushChanges();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to push");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePull = async () => {
    setIsLoading(true);
    
    try {
      await gitService.pullChanges();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pull");
    } finally {
      setIsLoading(false);
    }
  };

  if (!repository) {
    return (
      <div className="h-full flex flex-col p-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Clone Repository</h3>
        
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={cloneUrl}
            onChange={(e) => setCloneUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className="w-full px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          
          <button
            onClick={handleClone}
            disabled={isLoading || !cloneUrl.trim()}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cloning..." : "Clone"}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="mt-auto pt-4 text-xs text-gray-500">
          <p className="mb-1">Example repositories:</p>
          <div className="space-y-1">
            <button
              onClick={() => setCloneUrl("https://github.com/vercel/next.js.git")}
              className="block w-full text-left hover:text-gray-300"
            >
              • vercel/next.js
            </button>
            <button
              onClick={() => setCloneUrl("https://github.com/facebook/react.git")}
              className="block w-full text-left hover:text-gray-300"
            >
              • facebook/react
            </button>
            <button
              onClick={() => setCloneUrl("https://github.com/microsoft/vscode.git")}
              className="block w-full text-left hover:text-gray-300"
            >
              • microsoft/vscode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Repository Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 7h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1" />
          </svg>
          <span className="text-sm font-medium text-gray-200">{repository.name}</span>
        </div>
        
        <div className="text-xs text-gray-400">
          Branch: {repository.branch}
        </div>
      </div>

      {/* Branch Selector */}
      {branches.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700">
          <select className="w-full text-xs bg-gray-700 text-gray-200 rounded px-2 py-1 border border-gray-600">
            {branches.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name} {branch.isCurrent && "(current)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Changes Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
            Changes ({changes.length})
          </h4>
          
          {changes.length === 0 ? (
            <div className="text-xs text-gray-500">
              No changes detected
            </div>
          ) : (
            <div className="space-y-1">
              {changes.map((change) => (
                <div key={change.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-3 h-3 rounded-full ${
                    change.status === "added" ? "bg-green-400" :
                    change.status === "modified" ? "bg-yellow-400" : "bg-red-400"
                  }`} />
                  <span className="text-gray-300 truncate">{change.path}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commit Section */}
      <div className="p-3 border-t border-gray-700">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message"
          className="w-full h-16 px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded border border-gray-600 resize-none focus:border-blue-500 outline-none"
        />
        
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleCommit}
            disabled={isLoading || !commitMessage.trim()}
            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Commit
          </button>
          <button
            onClick={handlePush}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-700 disabled:opacity-50"
            title="Push"
          >
            ↑
          </button>
          <button
            onClick={handlePull}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-700 disabled:opacity-50"
            title="Pull"
          >
            ↓
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 text-xs text-red-400 bg-red-900/20">
          {error}
        </div>
      )}
    </div>
  );
}