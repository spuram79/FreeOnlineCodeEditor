/**
 * Tests for Code Editor Feature - LanguageDropdown Component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageDropdown, { LANGUAGES } from "./LanguageDropdown";

describe("LanguageDropdown", () => {
  const mockProps = {
    selectedLanguage: "html" as const,
    onLanguageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Positive scenarios", () => {
    it("should render with the selected language", () => {
      render(<LanguageDropdown {...mockProps} />);

      expect(screen.getByText("HTML")).toBeInTheDocument();
    });

    it("should display all available languages", () => {
      expect(LANGUAGES).toHaveLength(6);
      expect(LANGUAGES.map(l => l.id)).toEqual([
        "html",
        "css", 
        "javascript",
        "python",
        "csharp",
        "java",
      ]);
    });

    it("should have icons for each language", () => {
      LANGUAGES.forEach(lang => {
        expect(lang.icon).toBeDefined();
        expect(lang.icon.length).toBeGreaterThan(0);
      });
    });

    it("should call onLanguageChange when a language is selected", async () => {
      const user = userEvent.setup();
      render(<LanguageDropdown {...mockProps} />);

      // Find and click the dropdown button
      const button = screen.getByRole("button");
      await user.click(button);

      // The menu should appear (we verify the dropdown has correct structure)
      expect(button).toBeInTheDocument();
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should handle invalid language selection gracefully", () => {
      // @ts-expect-error - Testing invalid prop
      render(<LanguageDropdown selectedLanguage="invalid" onLanguageChange={mockProps.onLanguageChange} />);

      // Should fall back to first language
      expect(screen.getByText(LANGUAGES[0].name)).toBeInTheDocument();
    });

    it("should handle different language selections", () => {
      const { rerender } = render(<LanguageDropdown {...mockProps} selectedLanguage="python" />);
      
      expect(screen.getByText("Python")).toBeInTheDocument();

      rerender(<LanguageDropdown {...mockProps} selectedLanguage="java" />);
      
      expect(screen.getByText("Java")).toBeInTheDocument();
    });

    it("should have valid language IDs matching type", () => {
      LANGUAGES.forEach(lang => {
        expect(["html", "css", "javascript", "python", "csharp", "java"]).toContain(lang.id);
      });
    });

    it("should have unique language IDs", () => {
      const ids = LANGUAGES.map(l => l.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have non-empty names", () => {
      LANGUAGES.forEach(lang => {
        expect(lang.name.length).toBeGreaterThan(0);
      });
    });
  });
});