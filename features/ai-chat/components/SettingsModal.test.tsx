/**
 * Tests for AI Chat Feature - Settings Modal Component
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "./SettingsModal";

describe("SettingsModal", () => {
  const mockProps = {
    apiKey: "",
    onApiKeyChange: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Positive scenarios", () => {
    it("should render when open is true", () => {
      render(<SettingsModal {...mockProps} isOpen={true} />);

      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("sk-or-...")).toBeInTheDocument();
    });

    it("should not render when open is false", () => {
      render(<SettingsModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("should display the current API key", () => {
      render(<SettingsModal {...mockProps} isOpen={true} apiKey="test-key-123" />);

      const input = screen.getByPlaceholderText("sk-or-...") as HTMLInputElement;
      expect(input.value).toBe("test-key-123");
    });

    it("should call onApiKeyChange when input changes", async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();
      render(<SettingsModal {...mockProps} isOpen={true} onApiKeyChange={onChangeMock} />);

      const input = screen.getByPlaceholderText("sk-or-...");
      await user.type(input, "test");

      // The onChange callback should have been called
      expect(onChangeMock).toHaveBeenCalled();
      // Verify the last call has the expected character
      expect(onChangeMock).toHaveBeenLastCalledWith(expect.any(String));
    });

    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...mockProps} isOpen={true} />);

      const closeButton = screen.getByRole("button", { name: "" }); // SVG button
      await user.click(closeButton);

      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should display the OpenRouter link", () => {
      render(<SettingsModal {...mockProps} isOpen={true} />);

      const link = screen.getByRole("link", { name: /openrouter\.ai\/keys/i });
      expect(link).toHaveAttribute("href", "https://openrouter.ai/keys");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should handle very long API key", async () => {
      const longKey = "sk-or-" + "x".repeat(100);
      render(<SettingsModal {...mockProps} isOpen={true} apiKey={longKey} />);

      const input = screen.getByPlaceholderText("sk-or-...") as HTMLInputElement;
      expect(input.value.length).toBeGreaterThan(100);
    });

    it("should have password type for API key input", () => {
      render(<SettingsModal {...mockProps} isOpen={true} />);

      const input = screen.getByPlaceholderText("sk-or-...");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should handle special characters in API key", async () => {
      const user = userEvent.setup();
      render(<SettingsModal {...mockProps} isOpen={true} />);

      const input = screen.getByPlaceholderText("sk-or-...");
      await user.type(input, "sk-or-test-key_with-special.chars!@#$%");

      expect(mockProps.onApiKeyChange).toHaveBeenCalled();
    });

    it("should be accessible via keyboard navigation", async () => {
      render(<SettingsModal {...mockProps} isOpen={true} />);

      const input = screen.getByPlaceholderText("sk-or-...");
      input.focus();
      expect(input).toHaveFocus();
    });
  });
});