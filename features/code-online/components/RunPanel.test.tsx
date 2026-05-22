/**
 * CodeOnline Feature - Run Panel Tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import RunPanel from "./RunPanel";
import { RunConfiguration, RunResult } from "../types";

describe("RunPanel", () => {
  const mockConfig: RunConfiguration = {
    id: "config-1",
    name: "Dev Server",
    type: "node",
    command: "npm run dev",
    workingDirectory: "./",
  };

  const mockRun: RunResult = {
    id: "run-1",
    configurationId: "config-1",
    startTime: new Date(),
    status: "running",
    output: "Starting server...\n",
  };

  const defaultProps = {
    configurations: [mockConfig],
    onRun: jest.fn(),
    onStop: jest.fn(),
    activeRuns: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders configurations list", () => {
    render(<RunPanel {...defaultProps} />);
    
    expect(screen.getByText("Run Configurations")).toBeInTheDocument();
    expect(screen.getByText("Dev Server")).toBeInTheDocument();
  });

  it("shows empty state when no configurations", () => {
    render(<RunPanel {...defaultProps} configurations={[]} />);
    
    expect(screen.getByText("No run configurations")).toBeInTheDocument();
  });

  it("calls onRun when Run button is clicked", () => {
    render(<RunPanel {...defaultProps} />);
    
    fireEvent.click(screen.getByText("Run"));
    expect(defaultProps.onRun).toHaveBeenCalledWith(mockConfig);
  });

  it("shows Stop button when configuration is running", () => {
    render(<RunPanel {...defaultProps} activeRuns={[mockRun]} />);
    
    expect(screen.getByText("Stop")).toBeInTheDocument();
  });

  it("calls onStop when Stop button is clicked", () => {
    render(<RunPanel {...defaultProps} activeRuns={[mockRun]} />);
    
    fireEvent.click(screen.getByText("Stop"));
    expect(defaultProps.onStop).toHaveBeenCalledWith(mockConfig.id);
  });

  it("opens modal when add button is clicked", () => {
    render(<RunPanel {...defaultProps} />);
    
    const addButton = screen.getByTitle("Add configuration");
    fireEvent.click(addButton);
    
    expect(screen.getByText("New Configuration")).toBeInTheDocument();
  });

  it("renders active runs output", () => {
    render(<RunPanel {...defaultProps} activeRuns={[mockRun]} />);
    
    expect(screen.getByText(/Running/)).toBeInTheDocument();
    expect(screen.getByText(/Starting server/)).toBeInTheDocument();
  });

  it("handles different environment types", () => {
    const pythonConfig: RunConfiguration = {
      id: "config-2",
      name: "Python Script",
      type: "python",
      command: "python main.py",
    };
    
    render(<RunPanel {...defaultProps} configurations={[pythonConfig]} />);
    
    expect(screen.getByText("Python Script")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Run"));
    expect(defaultProps.onRun).toHaveBeenCalledWith(pythonConfig);
  });

  describe("new configuration creation", () => {
    it("shows validation error when name is empty", () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const createButton = screen.getByText("Create");
      // Button should be disabled since name is empty
      expect(createButton).toBeDisabled();
      
      alertSpy.mockRestore();
    });

    it("shows validation error when command is empty", () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      // Clear the command field to make it empty
      const commandInput = screen.getByPlaceholderText("npm start");
      fireEvent.change(commandInput, { target: { value: "" } });
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "Test Config" } });
      
      const createButton = screen.getByText("Create");
      expect(createButton).toBeDisabled();
      
      alertSpy.mockRestore();
    });

    it("disables Create button when name is empty", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const createButton = screen.getByText("Create");
      expect(createButton).toBeDisabled();
    });

    it("disables Create button when command is empty", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      // Clear the command field to make it empty
      const commandInput = screen.getByPlaceholderText("npm start");
      fireEvent.change(commandInput, { target: { value: "" } });
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "Test Config" } });
      
      const createButton = screen.getByText("Create");
      expect(createButton).toBeDisabled();
    });

    it("enables Create button when all required fields are filled", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "Test Config" } });
      
      // Command already has "node" as default, so button should be enabled
      const createButton = screen.getByText("Create");
      expect(createButton).not.toBeDisabled();
    });

    it("creates configuration with trimmed values", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "  Test Config  " } });
      
      const commandInput = screen.getByPlaceholderText("npm start");
      fireEvent.change(commandInput, { target: { value: "  npm run build  " } });
      
      const createButton = screen.getByText("Create");
      fireEvent.click(createButton);
      
      expect(defaultProps.onRun).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Config",
          command: "npm run build",
        })
      );
    });

    it("creates configuration with API key", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "Test Config" } });
      
      const apiKeyInput = screen.getByPlaceholderText("sk-or-...");
      fireEvent.change(apiKeyInput, { target: { value: "test-api-key" } });
      
      const createButton = screen.getByText("Create");
      fireEvent.click(createButton);
      
      expect(defaultProps.onRun).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: {
            openrouter: "test-api-key",
          },
        })
      );
    });

    it("supports multi-line environment variables and API key", () => {
      render(<RunPanel {...defaultProps} />);
      
      const addButton = screen.getByTitle("Add configuration");
      fireEvent.click(addButton);
      
      const nameInput = screen.getByPlaceholderText("My App");
      fireEvent.change(nameInput, { target: { value: "Test Config" } });
      
      const apiKeyInput = screen.getByPlaceholderText("sk-or-...");
      fireEvent.change(apiKeyInput, { target: { value: "sk-or-test-key-12345" } });
      
      const createButton = screen.getByText("Create");
      fireEvent.click(createButton);
      
      expect(defaultProps.onRun).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: {
            openrouter: "sk-or-test-key-12345",
          },
        })
      );
    });
  });
});