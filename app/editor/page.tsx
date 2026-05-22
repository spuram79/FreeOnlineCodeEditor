"use client";

import { useState, useEffect } from "react";
import {
  CodeEditor,
  LanguageDropdown,
  Language,
  CodeState,
  PythonCellContainer,
  usePythonCells,
  defaultHtml,
  defaultCss,
  defaultJs,
  defaultPython,
  defaultCSharp,
  defaultJava,
} from "@/features/code-editor";

declare global {
  interface Window {
    loadPyodide: any;
    pyodide: any;
  }
}

export default function FreeOnlineCodeEditor() {
  const [code, setCode] = useState<CodeState>({
    html: defaultHtml,
    css: defaultCss,
    javascript: defaultJs,
    python: defaultPython,
    csharp: defaultCSharp,
    java: defaultJava,
  });

  // UI state
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("html");
  const [previewKey, setPreviewKey] = useState(0);
  const [pythonMode, setPythonMode] = useState<"classic" | "colab">("colab");

  // Python Colab-like hook
  const {
    cells,
    pyodideReady,
    isLoading,
    loadPyodide,
    runCell,
    updateCellCode,
    addCell,
    deleteCell,
    moveCell,
  } = usePythonCells();

  // Check if current language needs output panel (Python)
  const needsOutputPanel = selectedLanguage === "python";

  // Load Pyodide when Python is selected in classic mode
  useEffect(() => {
    if (
      selectedLanguage === "python" &&
      pythonMode === "classic" &&
      !window.pyodide
    ) {
      loadPyodide();
    }
  }, [selectedLanguage, pythonMode, loadPyodide]);

  // Legacy runPython for classic mode
  const runPython = async (code: string, setOutput: (output: string) => void) => {
    if (!window.pyodide) {
      setOutput("Python is not ready yet. Please wait...\n");
      return;
    }

    setOutput("");
    try {
      await window.pyodide.runPythonAsync(`
import sys
from io import StringIO
import builtins

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

def print(*args, **kwargs):
    builtins.print(*args, **kwargs)

try:
    ${code.split("\n").map((line) => "    " + line).join("\n")}
except Exception as e:
    builtins.print(f"Error: {e}")
finally:
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
`);
      const output = window.pyodide.globals.get("output");
      setOutput(output ? output.toString() : "");
    } catch (error) {
      setOutput(`Error: ${error}\n`);
    }
  };

  const [pythonOutput, setPythonOutput] = useState<string>("");
  const [isPyodideLoading, setIsPyodideLoading] = useState<boolean>(false);
  const [pyodideReadyClassic, setPyodideReadyClassic] = useState<boolean>(false);

  // Load Pyodide for classic mode
  useEffect(() => {
    if (
      selectedLanguage === "python" &&
      pythonMode === "classic" &&
      !pyodideReadyClassic &&
      !isPyodideLoading
    ) {
      setIsPyodideLoading(true);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
      script.onload = async () => {
        try {
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
          });
          window.pyodide = pyodide;
          setPyodideReadyClassic(true);
          setPythonOutput((prev) => prev + "✓ Python loaded successfully!\n");
        } catch (error) {
          setPythonOutput((prev) => prev + `Error loading Python: ${error}\n`);
        }
      };
      document.body.appendChild(script);
    }
  }, [selectedLanguage, pythonMode, pyodideReadyClassic, isPyodideLoading]);

  const runPythonClassic = async () => {
    if (!window.pyodide || !pyodideReadyClassic) {
      setPythonOutput("Python is not ready yet. Please wait...\n");
      return;
    }

    setPythonOutput("");
    try {
      await window.pyodide.runPythonAsync(`
import sys
from io import StringIO
import builtins

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

def print(*args, **kwargs):
    builtins.print(*args, **kwargs)

try:
    ${code.python.split("\n").map((line) => "    " + line).join("\n")}
except Exception as e:
    builtins.print(f"Error: {e}")
finally:
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
`);
      const output = window.pyodide.globals.get("output");
      setPythonOutput(output ? output.toString() : "");
    } catch (error) {
      setPythonOutput(`Error: ${error}\n`);
    }
  };

  const generatePreview = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code.css}</style>
</head>
<body>
  ${code.html}
  <script>${code.javascript}<\/script>
</body>
</html>`;
    return fullHtml;
  };

  const refreshPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const getDisplayName = () => {
    switch (selectedLanguage) {
      case "html": return "HTML";
      case "css": return "CSS";
      case "javascript": return "JavaScript";
      case "python": return "Python";
      case "csharp": return "C#";
      case "java": return "Java";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Santosh Puram's Code Editor</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Edit HTML, CSS, JS, Python, C#, and Java</p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
              </svg>
              Home
            </a>
            <LanguageDropdown
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </header>

      {/* Python Mode Selector - Only shown when Python is selected */}
      {selectedLanguage === "python" && (
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode:</span>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPythonMode("colab")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  pythonMode === "colab"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Colab
              </button>
              <button
                onClick={() => setPythonMode("classic")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  pythonMode === "classic"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Classic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
          {/* Python Classic Mode Header - for Run button */}
          {selectedLanguage === "python" && pythonMode === "classic" && (
            <div className="flex bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PYTHON</span>
              </div>
              <div className="flex items-center gap-2">
                {isPyodideLoading && !pyodideReadyClassic && (
                  <span className="text-xs text-gray-500">Loading Python...</span>
                )}
                <button
                  onClick={runPythonClassic}
                  disabled={!pyodideReadyClassic}
                  className={`px-4 py-1.5 text-sm font-medium rounded bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  Run Python
                </button>
              </div>
            </div>
          )}

          {/* Code Editor or Python Colab Cells */}
          <div className="flex-1">
            {selectedLanguage === "python" && pythonMode === "colab" ? (
              <PythonCellContainer
                cells={cells}
                onCodeChange={updateCellCode}
                onRun={runCell}
                onDelete={deleteCell}
                onMoveUp={(cellId) => moveCell(cellId, "up")}
                onMoveDown={(cellId) => moveCell(cellId, "down")}
                onAddCell={addCell}
              />
            ) : (
              <CodeEditor
                language={selectedLanguage}
                value={code[selectedLanguage]}
                onChange={(value) => setCode((prev) => ({ ...prev, [selectedLanguage]: value || "" }))}
              />
            )}
          </div>
        </div>

        {/* Preview/Output Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Panel Header */}
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {needsOutputPanel && pythonMode === "classic" ? "Output" : needsOutputPanel ? "Output" : "Preview"}
              </span>
              {!needsOutputPanel && (
                <button
                  onClick={refreshPreview}
                  className="ml-auto px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {needsOutputPanel && pythonMode === "classic" ? (
              <div className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-auto">
                <pre className="whitespace-pre-wrap">{pythonOutput || "Click 'Run Python' to execute your code..."}</pre>
              </div>
            ) : !needsOutputPanel ? (
              <iframe
                key={previewKey}
                srcDoc={generatePreview()}
                title="Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              />
            ) : (
              // Python Colab mode - show current cell output
              <div className="w-full h-full bg-gray-900 text-green-400 font-mono text-sm p-4 overflow-auto">
                {cells.map((cell) => (
                  cell.output ? (
                    <div key={cell.id} className="mb-4">
                      <div className="text-gray-400 text-xs mb-1">Cell {cell.order + 1} output:</div>
                      <pre className="whitespace-pre-wrap">{cell.output}</pre>
                    </div>
                  ) : null
                ))}
                {cells.every(cell => !cell.output) && (
                  <span className="text-gray-400">Run a cell to see output...</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Made with ❤️ by Santosh Puram</span>
            <span>•</span>
            <span>{getDisplayName()}</span>
            {selectedLanguage === "python" && (
              <>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">{pythonMode.charAt(0).toUpperCase() + pythonMode.slice(1)} Mode</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}