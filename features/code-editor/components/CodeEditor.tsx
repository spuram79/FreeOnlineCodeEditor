/**
 * Code Editor Feature - Code Editor Component
 * 
 * Monaco-based code editor component.
 * Can be moved to a separate project by copying this file.
 */

"use client";

import Editor from "@monaco-editor/react";
import { Language } from "../types";

interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val || "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        wordWrap: "on",
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        renderWhitespace: "boundary",
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}