/**
 * AI Chat Feature - AI Assistant Tests
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIAssistant from "./AIAssistant";

// Mock scrollIntoView
HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock fetch globally
global.fetch = jest.fn();

describe("AIAssistant", () => {
  const mockEditorContext = {
    filePath: "/src/index.js",
    language: "javascript",
    content: "console.log('hello');",
    selection: {
      start: 0,
      end: 20,
      text: "console.log('hello');",
    },
  };

  const mockProps = {
    editorContext: mockEditorContext,
    onApplyChanges: jest.fn(),
    apiKey: "test-api-key",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders the AI assistant header", () => {
    render(<AIAssistant {...mockProps} />);
    
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
  });

  it("displays file path", () => {
    render(<AIAssistant {...mockProps} />);
    
    expect(screen.getByText("/src/index.js")).toBeInTheDocument();
  });

  it("renders quick action buttons", () => {
    render(<AIAssistant {...mockProps} />);
    
    expect(screen.getByTitle("Scan workspace for issues")).toBeInTheDocument();
    expect(screen.getByTitle("Explain the selected code")).toBeInTheDocument();
    expect(screen.getByTitle("Refactor for better readability")).toBeInTheDocument();
    expect(screen.getByTitle("Fix bugs or issues")).toBeInTheDocument();
  });

  it("renders input field", () => {
    render(<AIAssistant {...mockProps} />);
    
    expect(screen.getByPlaceholderText("Describe the change you want...")).toBeInTheDocument();
  });

  it("shows model selector", () => {
    render(<AIAssistant {...mockProps} />);
    
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("calls onModelChange when model is changed", () => {
    const onModelChange = jest.fn();
    render(<AIAssistant {...mockProps} onModelChange={onModelChange} />);
    
    const select = screen.getByRole("combobox");
    // Find an option that exists in FREE_MODELS
    const option = select.querySelector("option[value='meta-llama/llama-3.2-3b-instruct:free']") || 
                   select.querySelector("option[value='openrouter/free']");
    fireEvent.change(select, { target: { value: option?.getAttribute("value") } });
    
    expect(onModelChange).toHaveBeenCalledWith(option?.getAttribute("value"));
  });

  it("disables quick actions when no selection", () => {
    const contextNoSelection = {
      ...mockEditorContext,
      selection: null,
    };
    render(<AIAssistant {...mockProps} editorContext={contextNoSelection} />);
    
    const explainButton = screen.getByTitle("Explain the selected code").closest("button");
    expect(explainButton).toBeDisabled();
  });

  it("enables quick actions when selection exists", () => {
    render(<AIAssistant {...mockProps} />);
    
    const explainButton = screen.getByTitle("Explain the selected code").closest("button");
    expect(explainButton).not.toBeDisabled();
  });

  it("disables submit button when input is empty", () => {
    render(<AIAssistant {...mockProps} />);
    
    const submitButton = screen.getByText("Go");
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when input has content", () => {
    render(<AIAssistant {...mockProps} />);
    
    const input = screen.getByPlaceholderText("Describe the change you want...");
    fireEvent.change(input, { target: { value: "Add error handling" } });
    
    const submitButton = screen.getByText("Go");
    expect(submitButton).not.toBeDisabled();
  });

  describe("API interaction", () => {
    it("makes API call when form is submitted", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      });

      render(<AIAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText("Describe the change you want...");
      fireEvent.change(input, { target: { value: "Add error handling" } });
      
      const form = input.closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }));
      });
    });

    it("handles API error gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<AIAssistant {...mockProps} />);
      
      const input = screen.getByPlaceholderText("Describe the change you want...");
      fireEvent.change(input, { target: { value: "Add error handling" } });
      
      const form = input.closest("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });
  });

  describe("model selection", () => {
    it("displays model name in selector", () => {
      render(<AIAssistant {...mockProps} />);
      
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("openrouter/free");
    });

    it("accepts custom selectedModel prop", () => {
      render(<AIAssistant {...mockProps} selectedModel="openrouter/free" />);
      
      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("openrouter/free");
    });
  });

  describe("initial messages", () => {
    it("shows welcome message", () => {
      render(<AIAssistant {...mockProps} />);
      
      expect(screen.getByText(/I'm your AI coding assistant/)).toBeInTheDocument();
    });
  });
});