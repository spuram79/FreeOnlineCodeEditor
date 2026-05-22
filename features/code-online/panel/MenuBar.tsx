/**
 * CodeOnline Feature - Menu Bar Component
 * 
 * VSCode-like menu bar with dropdown functionality.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

interface MenuItem {
  label?: string;
  command?: string;
  separator?: boolean;
  submenu?: MenuItem[];
}

interface MenuBarProps {
  onMenuAction?: (command: string) => void;
}

const menus: MenuItem[][] = [
  // File Menu
  [
    { label: "New File", command: "workbench.action.newFile" },
    { label: "Open File", command: "workbench.action.openFile" },
    { label: "Open Code from Folder", command: "workbench.action.openFolder" },
    { label: "Save", command: "workbench.action.save" },
    { label: "Save As", command: "workbench.action.saveAs" },
    { separator: true },
    { label: "Close Editor", command: "workbench.action.closeEditor" },
    { label: "Close All", command: "workbench.action.closeAllEditors" },
    { separator: true },
    { label: "Preferences", submenu: [
      { label: "Settings", command: "workbench.action.preferences.openUserSettings" },
      { label: "Keyboard Shortcuts", command: "workbench.action.openGlobalKeybindings" },
    ]},
    { separator: true },
    { label: "Exit", command: "application.quit" },
  ],
  // Edit Menu
  [
    { label: "Undo", command: "undo" },
    { label: "Redo", command: "redo" },
    { separator: true },
    { label: "Cut", command: "cut" },
    { label: "Copy", command: "copy" },
    { label: "Paste", command: "paste" },
    { label: "Select All", command: "selectAll" },
  ],
  // View Menu
  [
    { label: "Explorer", command: "workbench.view.explorer" },
    { label: "Search", command: "workbench.view.search" },
    { label: "Source Control", command: "workbench.view.scm" },
    { label: "Debug", command: "workbench.view.debug" },
    { separator: true },
    { label: "Command Palette", command: "workbench.action.showCommands" },
    { label: "Toggle Zen Mode", command: "workbench.action.toggleZenMode" },
  ],
  // Run Menu
  [
    { label: "Run", command: "workbench.action.debug.start" },
    { label: "Debug", command: "workbench.action.debug.start" },
    { label: "Stop", command: "workbench.action.debug.stop" },
  ],
  // AI Assistant Menu
  [
    { label: "Ask AI", command: "ai-chat.ask" },
    { label: "Scan Workspace", command: "ai-chat.scanWorkspace" },
    { separator: true },
    { label: "Settings", command: "ai-chat.settings" },
  ],
];

const menuLabels = ["File", "Edit", "View", "Run", "AI Assistant"];

export default function MenuBar({ onMenuAction }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeMenu]);

  const handleMenuClick = (index: number) => {
    setActiveMenu(activeMenu === index ? null : index);
    setHoveredItem(null);
  };

  const handleItemClick = (command: string) => {
    onMenuAction?.(command);
    setActiveMenu(null);
  };

  const renderMenu = (menu: MenuItem, index: number) => {
    if (menu.separator) {
      return <div key={index} className="h-px bg-gray-600 my-1" />;
    }

    return (
      <div
        key={index}
        className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer rounded-sm flex items-center justify-between group"
        onMouseEnter={() => setHoveredItem(index)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => menu.command && handleItemClick(menu.command)}
      >
        <span>{menu.label || ""}</span>
        {menu.submenu && (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center px-2 bg-gray-800 border-b border-gray-700 h-8 text-sm select-none" ref={menuRef}>
      {menuLabels.map((label, index) => (
        <div key={label} className="relative">
          <button
            onClick={() => handleMenuClick(index)}
            className={`px-3 py-1 text-gray-200 hover:text-white hover:bg-gray-700 rounded-sm text-xs font-medium transition-colors ${
              activeMenu === index ? "bg-gray-600 text-white" : ""
            }`}
          >
            {label}
          </button>
          
          {/* Dropdown Menu */}
          {activeMenu === index && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1 max-h-96 overflow-y-auto">
              {menus[index].map((item, itemIndex) => renderMenu(item, itemIndex))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}