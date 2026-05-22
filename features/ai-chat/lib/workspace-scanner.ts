/**
 * AI Chat Feature - Workspace Scanner
 * 
 * Scans workspace for potential issues, bugs, and improvements.
 */

export interface ScanResult {
  file: string;
  issues: Array<{
    type: 'error' | 'warning' | 'info' | 'suggestion';
    message: string;
    line?: number;
  }>;
}

export interface ScanSummary {
  totalFiles: number;
  totalIssues: number;
  errors: number;
  warnings: number;
  suggestions: number;
  results: ScanResult[];
}

const KNOWN_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.md', '.py', '.java', '.go', '.rs', '.html', '.svg'];

export function scanWorkspace(fileStructure: any): ScanSummary {
  const results: ScanResult[] = [];
  let totalFiles = 0;
  let totalIssues = 0;
  let errors = 0;
  let warnings = 0;
  let suggestions = 0;

  const scanFile = (file: any): ScanResult => {
    const issues: ScanResult['issues'] = [];
    
    const content = file.content || '';
    const lines = content.split('\n');
    
    // Check for common issues
    if (content.includes('console.log')) {
      const lineNum = content.split('\n').findIndex(l => l.includes('console.log')) + 1;
      issues.push({ type: 'suggestion', message: 'Remove console.log statement', line: lineNum });
    }
    
    if (content.includes('TODO') || content.includes('FIXME')) {
      const lineNum = content.split('\n').findIndex(l => l.includes('TODO') || l.includes('FIXME')) + 1;
      issues.push({ type: 'warning', message: 'TODO/FIXME comment found', line: lineNum });
    }
    
    // Check for unused variables (simple heuristic)
    const varMatches = content.match(/const\s+\w+\s*=\s*null/g);
    if (varMatches) {
      issues.push({ type: 'suggestion', message: 'Found potentially unused variable(s)' });
    }
    
    // Check for empty blocks
    if (content.includes('{}') || content.includes('() => {}')) {
      issues.push({ type: 'warning', message: 'Empty block found' });
    }
    
    // Check for sensitive data patterns
    if (content.match(/(password|secret|key|token)\s*[:=]/i)) {
      issues.push({ type: 'error', message: 'Potential hardcoded secret detected' });
    }
    
    totalIssues += issues.length;
    errors += issues.filter(i => i.type === 'error').length;
    warnings += issues.filter(i => i.type === 'warning').length;
    suggestions += issues.filter(i => i.type === 'suggestion').length;
    
    return { file: file.path, issues };
  };

  const scanFolder = (folder: any) => {
    if (folder.children) {
      folder.children.forEach((child: any) => {
        if (child.type === 'folder') {
          scanFolder(child);
        } else if (child.type === 'file') {
          totalFiles++;
          results.push(scanFile(child));
        }
      });
    }
  };

  if (fileStructure.type === 'folder') {
    scanFolder(fileStructure);
  }

  return {
    totalFiles,
    totalIssues,
    errors,
    warnings,
    suggestions,
    results,
  };
}