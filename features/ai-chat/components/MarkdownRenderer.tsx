/**
 * AI Chat Feature - Markdown Renderer Component
 * 
 * Renders markdown with Claude/Perplexity-like styling including:
 * - Syntax highlighted code blocks with copy functionality
 * - Clean typography
 * - Proper spacing and formatting
 */

"use client";

import { useEffect, useRef } from "react";
import { marked } from "marked";
import Prism from "prismjs";

// Import prism languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

interface MarkdownRendererProps {
  content: string;
}

// Configure marked options
const configureMarked = () => {
  if (typeof marked !== 'undefined' && marked.setOptions) {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }
};
configureMarked();

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Apply syntax highlighting to all code blocks
      const codeBlocks = containerRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        Prism.highlightElement(block as HTMLElement);
      });
    }
  }, [content]);

  const renderMarkdown = (text: string) => {
    const html = marked(text) as string;
    return { __html: html };
  };

  return (
    <div
      ref={containerRef}
      className="markdown-content"
      dangerouslySetInnerHTML={renderMarkdown(content)}
    />
  );
}