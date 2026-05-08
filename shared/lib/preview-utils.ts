/**
 * Shared Utilities
 * 
 * Common utility functions that can be used across features.
 * Can be moved to a separate project by copying this file.
 */

/**
 * Generates a preview HTML document from HTML, CSS, and JavaScript code.
 */
export function generatePreviewHtml(html: string, css: string, javascript: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${javascript}<\/script>
</body>
</html>`;
}