/**
 * Code Editor Feature - Python Cell Component
 * 
 * Individual cell component for Google Colab-like Python editing.
 * Can be moved to a separate project by copying this file.
 */

"use client";

import { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { PythonCell } from "../types";
import { Play, Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";

interface PythonCellProps {
  cell: PythonCell;
  onCodeChange: (cellId: string, code: string) => void;
  onRun: (cellId: string) => void;
  onDelete: (cellId: string) => void;
  onMoveUp: (cellId: string) => void;
  onMoveDown: (cellId: string) => void;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
}

export default function PythonCellComponent({
  cell,
  onCodeChange,
  onRun,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  canDelete,
}: PythonCellProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (!cell.isRunning) {
        onRun(cell.id);
      }
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-800 overflow-hidden">
      {/* Cell Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Cell {cell.order + 1}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRun(cell.id)}
            disabled={cell.isRunning}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Run cell (Ctrl+Enter)"
          >
            <Play className="w-3 h-3" />
            Run
          </button>
          {!isFirst && (
            <button
              onClick={() => onMoveUp(cell.id)}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded"
              title="Move up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMoveDown(cell.id)}
              className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded"
              title="Move down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(cell.id)}
              className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded"
              title="Delete cell"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Cell Editor */}
      <div className="relative" onKeyDown={handleKeyDown}>
        <Editor
          height="150px"
          language="python"
          value={cell.code}
          onChange={(val) => onCodeChange(cell.id, val || "")}
          onMount={handleEditorDidMount}
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
            padding: { top: 8, bottom: 8 },
            scrollBeyondLastLine: false,
            renderWhitespace: "boundary",
            bracketPairColorization: { enabled: true },
          }}
        />
        {cell.isRunning && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Running...</span>
            </div>
          </div>
        )}
      </div>

      {/* Cell Output */}
      {cell.output && (
        <div className="bg-gray-900 text-green-400 font-mono text-xs p-3 max-h-60 overflow-auto">
          <pre className="whitespace-pre-wrap">{cell.output}</pre>
        </div>
      )}
    </div>
  );
}

interface PythonCellContainerProps {
  cells: PythonCell[];
  onCodeChange: (cellId: string, code: string) => void;
  onRun: (cellId: string) => void;
  onDelete: (cellId: string) => void;
  onMoveUp: (cellId: string) => void;
  onMoveDown: (cellId: string) => void;
  onAddCell: () => void;
}

export function PythonCellContainer({
  cells,
  onCodeChange,
  onRun,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddCell,
}: PythonCellContainerProps) {
  if (cells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-4">No cells yet. Add your first cell to get started!</p>
        <button
          onClick={onAddCell}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Cell
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {cells.map((cell, index) => (
        <PythonCellComponent
          key={cell.id}
          cell={cell}
          onCodeChange={onCodeChange}
          onRun={onRun}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={index === 0}
          isLast={index === cells.length - 1}
          canDelete={cells.length > 1}
        />
      ))}
      <div className="flex justify-center mt-4">
        <button
          onClick={onAddCell}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Cell
        </button>
      </div>
    </div>
  );
}