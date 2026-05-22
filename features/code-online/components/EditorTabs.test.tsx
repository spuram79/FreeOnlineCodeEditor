/**
 * CodeOnline Feature - Components Tests
 */

import { render, screen, fireEvent } from "@testing-library/react";
import EditorTabs from "./EditorTabs";
import { EditorTab } from "../../types";

describe("EditorTabs", () => {
  const mockTabs: EditorTab[] = [
    {
      id: "tab-1",
      name: "index.js",
      path: "/src/index.js",
      content: "console.log('hello');",
      language: "javascript",
      isDirty: false,
      isActive: true,
    },
    {
      id: "tab-2",
      name: "app.js",
      path: "/src/app.js",
      content: "function App() {}",
      language: "javascript",
      isDirty: true,
      isActive: false,
    },
  ];

  const mockOnTabSelect = jest.fn();
  const mockOnTabClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all tabs", () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
      />
    );

    expect(screen.getByText("index.js")).toBeInTheDocument();
    expect(screen.getByText("app.js")).toBeInTheDocument();
  });

  it("should highlight active tab", () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
      />
    );

    const activeTab = screen.getByText("index.js").closest("div");
    expect(activeTab).toHaveClass("bg-gray-900");
  });

  it("should call onTabSelect when tab is clicked", () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
      />
    );

    fireEvent.click(screen.getByText("app.js"));
    expect(mockOnTabSelect).toHaveBeenCalledWith("tab-2");
  });

  it("should show dirty indicator for modified tabs", () => {
    render(
      <EditorTabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
      />
    );

    // The dirty dot should be present for the dirty tab
    const dirtyIndicators = document.querySelectorAll(".rounded-full.bg-blue-400");
    expect(dirtyIndicators.length).toBeGreaterThan(0);
  });
});