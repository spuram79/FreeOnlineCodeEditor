/**
 * CodeOnline Feature - File Provider Context
 * 
 * Context for managing file sources (Git repository or local folder).
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FileInfo, LocalFolder, FileSource } from "../types/index";
import { readDirectory, readFile, getFileHandle } from "./local-file-utils";

interface FileContextValue {
  fileSource: FileSource;
  localFolder: LocalFolder | null;
  openLocalFolder: () => Promise<void>;
  openGitRepository: (url: string, branch?: string) => Promise<void>;
  getFileContent: (file: FileInfo) => Promise<string | null>;
}

const FileContext = createContext<FileContextValue | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [fileSource, setFileSource] = useState<FileSource>('none');
  const [localFolder, setLocalFolder] = useState<LocalFolder | null>(null);

  const openLocalFolder = useCallback(async () => {
    // Import dynamically to avoid SSR issues
    const { openLocalFolder: openFolder } = await import("../lib/local-file-utils");
    const folder = await openFolder();
    
    if (folder) {
      setLocalFolder(folder);
      setFileSource('local');
    }
  }, []);

  const openGitRepository = useCallback(async (url: string, branch?: string) => {
    // This will be handled by GitService
    setFileSource('git');
  }, []);

  const getFileContent = useCallback(async (file: FileInfo): Promise<string | null> => {
    if (fileSource === 'local' && localFolder) {
      try {
        const handle = await getFileHandle(localFolder.handle, file.path);
        if (handle) {
          return await readFile(handle);
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else if (fileSource === 'none') {
      // Return default workspace content
      return file.content || '';
    }
    return null;
  }, [fileSource, localFolder]);

  return (
    <FileContext.Provider value={{
      fileSource,
      localFolder,
      openLocalFolder,
      openGitRepository,
      getFileContent,
    }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
}