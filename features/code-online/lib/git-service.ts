/**
 * CodeOnline Feature - Git API Service
 * 
 * Service for Git repository operations using GitHub API.
 */

"use client";

import {
  GitRepository,
  GitCommit,
  GitFileChange,
  GitBranch,
  CloneOptions,
  CommitOptions,
  PushOptions,
  PullOptions,
} from "../types";

const GITHUB_API_BASE = "https://api.github.com";

// Simulated Git service (in production, this would use git commands via WASM or a backend service)
export class GitService {
  private token?: string;
  private repository?: GitRepository;

  constructor(token?: string) {
    this.token = token;
  }

  /**
   * Clone a repository from URL
   */
  async cloneRepository(options: CloneOptions): Promise<GitRepository> {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/repos/${this.extractRepoPath(options.url)}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.repository = {
        id: data.id.toString(),
        name: data.name,
        url: data.html_url,
        branch: options.branch || data.default_branch,
        isPrivate: data.private,
      };

      // Simulate fetching commits
      await this.fetchCommits();
      
      return this.repository;
    } catch (error) {
      console.error("Clone error:", error);
      throw error;
    }
  }

  /**
   * Get current repository
   */
  getCurrentRepository(): GitRepository | undefined {
    return this.repository;
  }

  /**
   * Fetch commits for the repository
   */
  async fetchCommits(): Promise<GitCommit[]> {
    if (!this.repository) return [];

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.extractRepoPath(this.repository.url)}/commits`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      // Store commits in repository
      if (this.repository) {
        this.repository.lastCommit = {
          id: data[0]?.sha || "",
          message: data[0]?.commit?.message || "",
          author: data[0]?.commit?.author?.name || "",
          timestamp: new Date(data[0]?.commit?.author?.date || ""),
          sha: data[0]?.sha || "",
        };
      }

      return data.map((c: any) => ({
        id: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        timestamp: new Date(c.commit.author.date),
        sha: c.sha,
      }));
    } catch (error) {
      console.error("Fetch commits error:", error);
      return [];
    }
  }

  /**
   * Fetch branches
   */
  async fetchBranches(): Promise<GitBranch[]> {
    if (!this.repository) return [];

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${this.extractRepoPath(this.repository.url)}/branches`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      return data.map((b: any) => ({
        id: b.name,
        name: b.name,
        isCurrent: b.name === this.repository?.branch,
        isRemote: true,
      }));
    } catch (error) {
      console.error("Fetch branches error:", error);
      return [];
    }
  }

  /**
   * Stage files for commit
   */
  async stageFiles(files: string[]): Promise<void> {
    // In a real implementation, this would stage files via git commands
    console.log("Staging files:", files);
  }

  /**
   * Commit changes
   */
  async commitChanges(options: CommitOptions): Promise<GitCommit> {
    // In a real implementation, this would create a commit via git commands
    const commit: GitCommit = {
      id: Date.now().toString(),
      message: options.message,
      author: "User",
      timestamp: new Date(),
      sha: Math.random().toString(36).substring(7),
    };

    if (this.repository) {
      this.repository.lastCommit = commit;
    }

    return commit;
  }

  /**
   * Push changes
   */
  async pushChanges(options?: PushOptions): Promise<void> {
    // In a real implementation, this would push via git commands
    console.log("Pushing to:", options?.remote || "origin", options?.branch);
  }

  /**
   * Pull changes
   */
  async pullChanges(options?: PullOptions): Promise<void> {
    // In a real implementation, this would pull via git commands
    console.log("Pulling from:", options?.remote || "origin", options?.branch);
  }

  /**
   * Get file changes (simulated)
   */
  getFileChanges(): GitFileChange[] {
    // In a real implementation, this would compare working tree with index
    return [];
  }

  /**
   * Helper to extract repo path from GitHub URL
   */
  private extractRepoPath(url: string): string {
    const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
    if (match) return match[1].replace(/.git$/, "");
    throw new Error("Invalid GitHub URL");
  }

  /**
   * Get auth headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
    };

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }

    return headers;
  }
}

// Singleton instance
let gitService: GitService | null = null;

export function getGitService(token?: string): GitService {
  if (!gitService) {
    gitService = new GitService(token);
  }
  return gitService;
}