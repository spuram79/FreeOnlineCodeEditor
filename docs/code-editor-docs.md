# Code Editor Application - Technical Documentation

## Overview

The Code Editor application provides a full-featured online code editing environment with support for multiple programming languages. Python editing is available in both "Classic" (single editor) and "Colab" (cell-based) modes, similar to Google Colab.

## Architecture

### Component Hierarchy

#### Classic Mode
```
CodeEditorPage
├── LanguageDropdown
├── CodeEditor (Monaco)
│   └── Editor (HTML/CSS/JS/Python/C#/Java)
├── OutputPanel
│   └── Python Output OR HTML Preview
└── StatusBar
```

#### Colab Mode
```
CodeEditorPage
├── LanguageDropdown
├── PythonCellContainer
│   ├── PythonCell (multiple)
│   │   ├── CellHeader (controls)
│   │   ├── Monaco Editor
│   │   └── CellOutput
│   └── AddCellButton
└── GlobalOutputPanel
```

### File Structure

```
features/code-editor/
├── components/
│   ├── CodeEditor.tsx           # Monaco-based editor component
│   ├── LanguageDropdown.tsx     # Language selector
│   └── PythonCell.tsx           # Cell-based Python interface
├── lib/
│   ├── usePythonCells.ts        # Cell state management hook
│   ├── web-templates.ts         # HTML/CSS/JS templates
│   ├── python-template.ts       # Python template
│   ├── csharp-template.ts       # C# template
│   └── java-template.ts         # Java template
├── types.ts                     # TypeScript interfaces
├── index.ts                     # Public exports
└── code-editor-docs.md          # This documentation
```

## Core Components

### CodeEditor.tsx

**Purpose**: Wrapper around Monaco Editor for code editing.

**Props**:
```typescript
interface CodeEditorProps {
  language: Language;
  value: string;
  onChange: (value: string) => void;
}
```

**Configuration**:
```typescript
options={{
  fontSize: 14,
  fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  lineNumbers: "on",
  wordWrap: "on",
  automaticLayout: true,
  bracketPairColorization: { enabled: true },
}}
```

### LanguageDropdown.tsx

**Purpose**: Language selection dropdown.

**Props**:
```typescript
interface LanguageDropdownProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}
```

**Supported Languages**:
- HTML
- CSS
- JavaScript
- Python
- C#
- Java

### PythonCell.tsx

**Purpose**: Individual cell component for Colab-style editing.

**Props**:
```typescript
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
```

**Cell Structure**:
```typescript
interface PythonCell {
  id: string;
  code: string;
  output: string;
  isRunning: boolean;
  order: number;
}
```

### PythonCellContainer.tsx

**Purpose**: Manages multiple cells with add cell functionality.

**Features**:
- Renders list of PythonCell components
- Empty state with "Add Cell" button
- "Add Cell" button between cells

## Hooks

### usePythonCells

**Purpose**: Manages Python cell state and execution.

**Return Value**:
```typescript
{
  cells: PythonCell[];
  pyodideReady: boolean;
  isLoading: boolean;
  loadPyodide: () => Promise<void>;
  runCell: (cellId: string) => Promise<void>;
  updateCellCode: (cellId: string, code: string) => void;
  addCell: (afterCellId?: string) => void;
  deleteCell: (cellId: string) => void;
  moveCell: (cellId: string, direction: "up" | "down") => void;
  clearAllOutputs: () => void;
}
```

## Python Execution

### Pyodide Integration

**Loading Pyodide**:
```typescript
const pyodide = await window.loadPyodide({
  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
});
```

### Code Execution

```typescript
await pyodide.runPythonAsync(`
  import sys
  from io import StringIO
  
  old_stdout = sys.stdout
  sys.stdout = StringIO()
  
  try:
    ${cell.code.split("\n").map((line) => "    " + line).join("\n")}
  except Exception as e:
    builtins.print(f"Error: {e}")
  finally:
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
`);
```

### Output Capture

The stdout is captured using Python's StringIO and returned to JavaScript for display.

## Modes

### Colab Mode (Python)

**Features**:
- Cell-based editing
- Individual cell execution
- Cell reordering (up/down)
- Cell deletion
- "Add Cell" button
- Ctrl+Enter to run cell

**Keyboard Shortcuts**:
- `Ctrl/Cmd + Enter`: Run current cell
- `Shift + Enter`: Add new cell and move to it

### Classic Mode (Python)

**Features**:
- Single editor
- Shared output panel
- Full code execution
- Loading indicator

### Web Mode (HTML/CSS/JS)

**Features**:
- Tabbed editing (HTML/CSS/JS)
- Live preview panel
- Refresh button
- Responsive iframe preview

### Other Languages (C#/Java)

**Features**:
- Code editing only (no execution)
- Syntax highlighting
- Future: Compilation support

## Templates

Each language has a default template:

### Python Template
```python
# Welcome to Poolside Python Editor!
# Each cell runs independently

print("Hello, World!")
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

## Styling

### Dimensions

- Editor: 50% width (left panel)
- Preview/Output: 50% width (right panel)
- Cell height: 150px (Python Colab)
- Full height: 100% (Classic mode)

### Themes

- Editor: vs-dark theme
- Output: Dark terminal style
- Preview: Clean white background

## Testing

### Test Files

```
features/code-editor/
├── components/
│   └── LanguageDropdown.test.tsx
├── lib/
│   └── templates.test.ts
├── types.test.ts
└── code-editor.test.ts
```

### Test Coverage

- Language switching
- Template loading
- Cell operations (add/delete/move)
- Code change handling
- Output rendering

## Performance

- Monaco Editor lazy loading
- Pyodide loaded on-demand
- Cell virtualization for large numbers
- Automatic layout updates

## Error Handling

### Python Errors
- Syntax errors displayed in output
- Runtime errors caught and displayed
- Loading errors shown in console

### Editor Errors
- Graceful fallbacks for unsupported browsers
- Error boundaries around cells

## Security

- Sandboxed iframe for web preview
- Pyodide runs in isolated context
- No server-side code execution

## Future Enhancements

- [ ] Code completion/intellisense
- [ ] Debugging support
- [ ] File import/export
- [ ] Code sharing
- [ ] C#/Java compilation
- [ ] More Python packages support
- [ ] Jupyter notebook format import/export