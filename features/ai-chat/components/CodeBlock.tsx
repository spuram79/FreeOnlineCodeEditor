/**
 * AI Chat Feature - Code Block Component
 * 
 * Displays code with syntax highlighting and copy-to-clipboard functionality.
 * Styled to match Claude's code display with improved aesthetics.
 */

"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showHeader?: boolean;
}

export default function CodeBlock({ code, language = "text", showHeader = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languageMap: { [key: string]: string } = {
    js: "JavaScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    rust: "Rust",
    java: "Java",
    cpp: "C++",
    c: "C",
    sh: "Bash",
    bash: "Bash",
    sql: "SQL",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    html: "HTML",
    css: "CSS",
    md: "Markdown",
  };

  const displayLanguage = languageMap[language.toLowerCase()] || language.toUpperCase();

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shadow-sm">
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {displayLanguage}
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200 max-h-96 overflow-y-auto">
        <code className={`language-${displayLanguage.toLowerCase()}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}