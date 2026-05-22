/**
 * CodeOnline Feature - Local File System Utilities
 * 
 * Utilities for accessing local files using File System Access API.
 */

"use client";

import { FileInfo, LocalFolder } from "../types";

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Get language from file extension
 */
export function getLanguage(extension: string): string {
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    html: 'html',
    htm: 'html',
    json: 'json',
    md: 'markdown',
    markdown: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    sh: 'shell',
    bash: 'shell',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    sql: 'sql',
    graphql: 'graphql',
    prisma: 'prisma',
    env: 'env',
    toml: 'toml',
  };
  return langMap[extension] || 'plaintext';
}

/**
 * Recursively read directory structure using File System Access API
 */
export async function readDirectory(
  handle: FileSystemDirectoryHandle,
  path: string = '/'
): Promise<FileInfo> {
  const children: FileInfo[] = [];
  
  // @ts-ignore - File System Access API types
  for await (const [name, entry] of handle.entries()) {
    const entryPath = `${path}${name}`;
    
    if (entry.kind === 'file') {
      const fileHandle = entry as FileSystemFileHandle;
      const file: FileInfo = {
        id: entryPath,
        name,
        path: entryPath,
        extension: getFileExtension(name),
        type: 'file',
        language: getLanguage(getFileExtension(name)),
      };
      children.push(file);
    } else if (entry.kind === 'directory') {
      const folderHandle = entry as FileSystemDirectoryHandle;
      const folder = await readDirectory(folderHandle, `${entryPath}/`);
      children.push(folder);
    }
  }
  
  // Sort: folders first, then files, both alphabetically
  children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    id: path,
    name: path === '/' ? 'workspace' : handle.name || 'folder',
    path,
    type: 'folder',
    extension: '',
    children,
  };
}

/**
 * Read file content using File System Access API
 */
export async function readFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return await file.text();
}

/**
 * Get current folder handle from a directory input
 */
export async function openLocalFolder(): Promise<LocalFolder | null> {
  // Check if File System Access API is supported
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or another Chromium-based browser.');
    return null;
  }

  try {
    // @ts-ignore - File System Access API types
    const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      id: 'codeonline-folder',
      mode: 'read',
    });
    
    return {
      name: handle.name,
      handle,
      path: `/${handle.name}`,
    };
  } catch (error) {
    // User cancelled the picker
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }
    console.error('Error opening folder:', error);
    return null;
  }
}

/**
 * Reopen the previously selected folder (if user granted persistent permission)
 * This uses showDirectoryPicker with an id to recall previous entries
 */
export async function reopenLastFolder(): Promise<LocalFolder | null> {
  // Check if File System Access API is supported
  if (!('showDirectoryPicker' in window)) {
    return null;
  }

  try {
    // Try to reopen with the same id - browser handles persistence
    // @ts-ignore - File System Access API types
    const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      id: 'codeonline-folder',
      mode: 'read',
      startIn: 'workspace', // Start in workspace area
    });
    
    return {
      name: handle.name,
      handle,
      path: `/${handle.name}`,
    };
  } catch (error) {
    // User cancelled or no previous folder
    console.log('No previous folder to reopen:', error);
    return null;
  }
}

/**
 * Get file handle from directory handle
 */
export async function getFileHandle(
  directoryHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<FileSystemFileHandle | null> {
  const parts = filePath.split('/').filter(p => p && p !== directoryHandle.name);
  
  let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = directoryHandle;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;
    
    if (isLast) {
      // Try to get file handle
      try {
        // @ts-ignore
        return await (currentHandle as FileSystemDirectoryHandle).getFileHandle(part);
      } catch {
        return null;
      }
    } else {
      // Get directory handle
      try {
        // @ts-ignore
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(part);
      } catch {
        return null;
      }
    }
  }
  
  return null;
}