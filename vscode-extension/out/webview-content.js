"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebviewContent = getWebviewContent;
exports.getWebviewScript = getWebviewScript;
const vscode = __importStar(require("vscode"));
function getWebviewContent(webview, extensionUri) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'out', 'webview.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'style.css'));
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>Free AI Chat</title>
</head>
<body>
  <div id="app">
    <div class="header">
      <h2>Free AI Chat</h2>
      <div class="model-selector">
        <select id="modelSelect">
          <option value="openrouter/free">Loading models...</option>
        </select>
      </div>
    </div>
    
    <div id="messages" class="messages-container"></div>
    
    <div class="input-container">
      <textarea id="promptInput" placeholder="Type your message..." rows="3"></textarea>
      <button id="sendButton" class="send-btn">Send</button>
    </div>
    
    <div id="loadingIndicator" class="loading-indicator hidden">
      <span class="spinner"></span> AI is thinking...
    </div>
  </div>
  
  <script src="${scriptUri}"></script>
</body>
</html>`;
}
// This file needs to be built into webview.js
// For simplicity, we'll inline the webview script
function getWebviewScript() {
    return `
  const vscode = acquireVsCodeApi();
  
  // State
  let isLoading = false;
  let messages = [];
  let models = [];
  let currentModel = 'openrouter/free';
  
  // DOM Elements
  const messagesContainer = document.getElementById('messages');
  const promptInput = document.getElementById('promptInput');
  const sendButton = document.getElementById('sendButton');
  const modelSelect = document.getElementById('modelSelect');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  // Initialize
  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
      case 'response':
        addMessage('assistant', message.content);
        break;
      case 'loading':
        setLoading(message.isLoading);
        break;
      case 'error':
        showError(message.message);
        break;
      case 'clear':
        messages = [];
        messagesContainer.innerHTML = '';
        break;
      case 'modelList':
        models = message.models;
        populateModels();
        break;
      case 'preload':
        promptInput.value = message.text;
        break;
      case 'config':
        currentModel = message.model;
        if (models.length === 0) {
          vscode.postMessage({ command: 'getModelList' });
        }
        break;
    }
  });
  
  // Request initial config
  vscode.postMessage({ command: 'getConfig' });
  
  // Populate model selector
  function populateModels() {
    if (models.length === 0) return;
    
    modelSelect.innerHTML = '';
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name || model.id;
      if (model.id === currentModel) option.selected = true;
      modelSelect.appendChild(option);
    });
  }
  
  // Model change handler
  modelSelect.addEventListener('change', () => {
    currentModel = modelSelect.value;
  });
  
  // Send message
  function sendMessage() {
    const text = promptInput.value.trim();
    if (!text || isLoading) return;
    
    addMessage('user', text);
    promptInput.value = '';
    
    vscode.postMessage({
      command: 'send',
      text: text,
      model: currentModel
    });
  }
  
  // Add message to UI
  function addMessage(role, content) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message ' + role + '-message';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.textContent = role === 'user' ? 'You' : 'AI';
    messageEl.appendChild(header);
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = content;
    messageEl.appendChild(contentEl);
    
    // Add action buttons for AI messages
    if (role === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'message-actions';
      
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(content);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      };
      
      const insertBtn = document.createElement('button');
      insertBtn.textContent = 'Insert';
      insertBtn.onclick = () => {
        vscode.postMessage({ command: 'insert', text: content });
      };
      
      actions.appendChild(copyBtn);
      actions.appendChild(insertBtn);
      messageEl.appendChild(actions);
    }
    
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Set loading state
  function setLoading(loading) {
    isLoading = loading;
    loadingIndicator.classList.toggle('hidden', !loading);
    sendButton.disabled = loading;
    sendButton.textContent = loading ? 'Sending...' : 'Send';
  }
  
  // Show error
  function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    messagesContainer.appendChild(errorEl);
  }
  
  // Event listeners
  sendButton.addEventListener('click', sendMessage);
  promptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  `;
}
//# sourceMappingURL=webview-content.js.map