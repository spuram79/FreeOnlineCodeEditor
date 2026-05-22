/**
 * ResizablePanel Component
 * 
 * A draggable resizable panel component for the editor layout.
 * Supports horizontal and vertical resizing with visual feedback.
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

interface ResizablePanelProps {
  children: React.ReactNode;
  initialSize: number; // Percentage (0-100)
  minSize?: number; // Percentage
  maxSize?: number; // Percentage
  direction?: "horizontal" | "vertical";
  onResize?: (size: number) => void;
  className?: string;
  showHandle?: boolean;
}

export default function ResizablePanel({
  children,
  initialSize,
  minSize = 10,
  maxSize = 80,
  direction = "horizontal",
  onResize,
  className = "",
  showHandle = true,
}: ResizablePanelProps) {
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startSizeRef.current = size;

      // Add global mouse event listeners
      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (direction === "horizontal") {
          const deltaX = moveEvent.clientX - startXRef.current;
          const parentRect = panelRef.current?.parentElement?.getBoundingClientRect();
          if (parentRect) {
            const deltaPercent = (deltaX / parentRect.width) * 100;
            const newSize = Math.min(Math.max(startSizeRef.current + deltaPercent, minSize), maxSize);
            setSize(newSize);
          }
        } else {
          const deltaY = moveEvent.clientY - startYRef.current;
          const parentRect = panelRef.current?.parentElement?.getBoundingClientRect();
          if (parentRect) {
            const deltaPercent = (deltaY / parentRect.height) * 100;
            const newSize = Math.min(Math.max(startSizeRef.current - deltaPercent, minSize), maxSize);
            setSize(newSize);
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        onResize?.(size);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [direction, size, minSize, maxSize, onResize]
  );

  const resizeStyle: React.CSSProperties = {
    flex: `0 0 ${size}%`,
    width: `${size}%`,
    minWidth: `${minSize}%`,
    maxWidth: `${maxSize}%`,
  };

  const handleStyle: React.CSSProperties = {
    cursor: direction === "horizontal" ? "col-resize" : "row-resize",
    userSelect: "none",
    flexShrink: 0,
    display: showHandle ? "flex" : "none",
  };

  return (
    <div
      ref={panelRef}
      className={`relative ${className}`}
      style={resizeStyle}
    >
      {/* Panel Content */}
      <div className="h-full overflow-hidden">{children}</div>

      {/* Resize Handle */}
      {showHandle && (
        <div
          className={`absolute ${
            direction === "horizontal"
              ? "right-0 top-0 h-full w-2 hover:bg-gray-600"
              : "top-0 left-0 w-full h-2 hover:bg-gray-600"
          } flex items-center justify-center bg-gray-700 ${
            isDragging ? "bg-blue-500" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <div
            className={`absolute ${
              direction === "horizontal"
                ? "w-1 h-6 bg-gray-400 rounded-full"
                : "h-1 w-6 bg-gray-400 rounded-full"
            }`}
          />
        </div>
      )}
    </div>
  );
}