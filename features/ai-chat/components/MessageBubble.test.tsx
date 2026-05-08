/**
 * Tests for AI Chat Feature - Message Bubble Component
 */

import { render, screen } from "@testing-library/react";
import MessageBubble from "./MessageBubble";
import { Message } from "../types";

describe("MessageBubble", () => {
  describe("Positive scenarios", () => {
    it("should render user message with correct styling", () => {
      const userMessage: Message = { role: "user", content: "Hello AI!" };
      render(<MessageBubble message={userMessage} />);

      expect(screen.getByText("Hello AI!")).toBeInTheDocument();
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    it("should render assistant message with correct styling", () => {
      const assistantMessage: Message = { role: "assistant", content: "Hello! How can I help?" };
      render(<MessageBubble message={assistantMessage} />);

      expect(screen.getByText("Hello! How can I help?")).toBeInTheDocument();
      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("should handle multiline content", () => {
      const multilineMessage: Message = {
        role: "user",
        content: "Line 1\nLine 2\nLine 3",
      };
      render(<MessageBubble message={multilineMessage} />);

      expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Line 2/)).toBeInTheDocument();
      expect(screen.getByText(/Line 3/)).toBeInTheDocument();
    });

    it("should handle special characters in content", () => {
      const specialMessage: Message = {
        role: "user",
        content: "Special chars: <>&\"'",
      };
      render(<MessageBubble message={specialMessage} />);

      expect(screen.getByText(/Special chars/)).toBeInTheDocument();
    });

    it("should handle empty content", () => {
      const emptyMessage: Message = { role: "user", content: "" };
      const { container } = render(<MessageBubble message={emptyMessage} />);

      expect(container.querySelector(".whitespace-pre-wrap")).toBeInTheDocument();
    });

    it("should handle very long content", () => {
      const longContent = "A".repeat(10000);
      const longMessage: Message = { role: "user", content: longContent };
      render(<MessageBubble message={longMessage} />);

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });
  });

  describe("Negative scenarios and edge cases", () => {
    it("should apply correct alignment for user message", () => {
      const userMessage: Message = { role: "user", content: "Test" };
      const { container } = render(<MessageBubble message={userMessage} />);

      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toHaveClass("justify-end");
    });

    it("should apply correct alignment for assistant message", () => {
      const assistantMessage: Message = { role: "assistant", content: "Test" };
      const { container } = render(<MessageBubble message={assistantMessage} />);

      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toHaveClass("justify-start");
    });

    it("should handle unicode characters", () => {
      const unicodeMessage: Message = {
        role: "user",
        content: "Hello 你好 مرحبا 🌍🎉",
      };
      render(<MessageBubble message={unicodeMessage} />);

      expect(screen.getByText(/Hello 你好/)).toBeInTheDocument();
    });

    it("should handle code-like content", () => {
      const codeMessage: Message = {
        role: "assistant",
        content: "```javascript\nconst x = 1;\n```",
      };
      render(<MessageBubble message={codeMessage} />);

      expect(screen.getByText(/const x = 1;/)).toBeInTheDocument();
    });
  });
});