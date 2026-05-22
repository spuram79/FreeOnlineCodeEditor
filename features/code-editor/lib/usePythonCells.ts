/**
 * Code Editor Feature - usePythonCells Hook
 * 
 * Custom hook for managing Python cells state with Pyodide execution.
 * Can be moved to a separate project by copying this file.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { PythonCell, PythonCellState } from "../types";

// Simple UUID generator for client-side usage
function generateId(): string {
  return "cell_" + Math.random().toString(36).substring(2, 11);
}

export function usePythonCells() {
  const [state, setState] = useState<PythonCellState>({
    cells: [
      {
        id: generateId(),
        code: '# Welcome to Poolside Python Editor!\n# Each cell runs independently\n\nprint("Hello, World!")',
        output: "",
        isRunning: false,
        order: 0,
      },
    ],
    pyodideReady: false,
    isLoading: false,
  });

  const pyodideRef = useRef<any>(null);

  const loadPyodide = useCallback(async () => {
    if (state.pyodideReady || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide"));
          document.body.appendChild(script);
        });
      }

      const pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
      });

      pyodideRef.current = pyodide;
      setState((prev) => ({ ...prev, pyodideReady: true, isLoading: false }));

      // Update first cell output to show ready
      setState((prev) => ({
        ...prev,
        cells: prev.cells.map((cell, i) =>
          i === 0 ? { ...cell, output: "✓ Python loaded successfully!\n" + cell.output } : cell
        ),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        cells: prev.cells.map((cell) => ({
          ...cell,
          output: (cell.output || "") + `Error loading Python: ${error}\n`,
        })),
      }));
    }
  }, [state.pyodideReady, state.isLoading]);

  const runCell = useCallback(
    async (cellId: string) => {
      const cell = state.cells.find((c) => c.id === cellId);
      if (!cell || !pyodideRef.current) return;

      setState((prev) => ({
        ...prev,
        cells: prev.cells.map((c) =>
          c.id === cellId ? { ...c, isRunning: true, output: "" } : c
        ),
      }));

      try {
        await pyodideRef.current.runPythonAsync(`
import sys
from io import StringIO
import builtins

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

def print(*args, **kwargs):
    builtins.print(*args, **kwargs)

try:
    ${cell.code.split("\n").map((line) => "    " + line).join("\n")}
except Exception as e:
    builtins.print(f"Error: {e}")
finally:
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
`);
        const output = pyodideRef.current.globals.get("output");
        setState((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? { ...c, output: output ? output.toString() : "", isRunning: false }
              : c
          ),
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? { ...c, output: `Error: ${error}\n`, isRunning: false }
              : c
          ),
        }));
      }
    },
    [state.cells]
  );

  const updateCellCode = useCallback((cellId: string, code: string) => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === cellId ? { ...c, code } : c)),
    }));
  }, []);

  const addCell = useCallback((afterCellId?: string) => {
    const newCell: PythonCell = {
      id: generateId(),
      code: "",
      output: "",
      isRunning: false,
      order: 0,
    };

    setState((prev) => {
      const newCells = [...prev.cells];
      if (afterCellId) {
        const index = newCells.findIndex((c) => c.id === afterCellId);
        if (index !== -1) {
          newCells.splice(index + 1, 0, newCell);
        } else {
          newCells.push(newCell);
        }
      } else {
        newCells.push(newCell);
      }

      // Reorder cells
      return {
        ...prev,
        cells: newCells.map((cell, index) => ({ ...cell, order: index })),
      };
    });
  }, []);

  const deleteCell = useCallback((cellId: string) => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.filter((c) => c.id !== cellId).map((cell, index) => ({ ...cell, order: index })),
    }));
  }, []);

  const moveCell = useCallback((cellId: string, direction: "up" | "down") => {
    setState((prev) => {
      const cells = [...prev.cells];
      const index = cells.findIndex((c) => c.id === cellId);

      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= cells.length) return prev;

      // Swap cells
      [cells[index], cells[newIndex]] = [cells[newIndex], cells[index]];

      // Update order
      return {
        ...prev,
        cells: cells.map((cell, i) => ({ ...cell, order: i })),
      };
    });
  }, []);

  const clearAllOutputs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => ({ ...c, output: "" })),
    }));
  }, []);

  return {
    cells: state.cells,
    pyodideReady: state.pyodideReady,
    isLoading: state.isLoading,
    loadPyodide,
    runCell,
    updateCellCode,
    addCell,
    deleteCell,
    moveCell: (cellId: string, direction: "up" | "down") => moveCell(cellId, direction),
    clearAllOutputs,
  };
}