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
exports.ChatProvider = void 0;
const vscode = __importStar(require("vscode"));
const webview_content_1 = require("./webview-content");
class ChatProvider {
    panel;
    context;
    apiClient;
    messages = [];
    constructor(context, apiClient) {
        this.context = context;
        this.apiClient = apiClient;
    }
    openChatPanel() {
        const config = vscode.workspace.getConfiguration('free-ai-chat');
        const panel = vscode.window.createWebviewPanel('freeAiChat', 'Free AI Chat', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                this.context.extensionUri
            ]
        });
        this.panel = panel;
        this.messages = [];
        panel.webview.html = (0, webview_content_1.getWebviewContent)(panel.webview, this.context.extensionUri);
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'send':
                    await this.handleSend(message.text, message.model);
                    break;
                case 'clear':
                    this.messages = [];
                    panel.webview.postMessage({ command: 'clear' });
                    break;
                case 'insert':
                    this.insertResponse(message.text);
                    break;
                case 'getModelList':
                    await this.sendModelList(panel.webview);
                    break;
                case 'getConfig':
                    panel.webview.postMessage({
                        command: 'config',
                        apiKey: this.apiClient.getApiKey(),
                        endpoint: config.get('endpoint'),
                        model: config.get('defaultModel')
                    });
                    break;
            }
        });
        // Handle panel disposal
        panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    async handleSend(text, model) {
        if (!this.panel)
            return;
        if (!this.apiClient.isAuthenticated()) {
            vscode.window.showErrorMessage('Please set your OpenRouter API key in settings (free-ai-chat.apiKey)');
            this.panel.webview.postMessage({ command: 'apiKeyRequired' });
            return;
        }
        this.messages.push({ role: 'user', content: text });
        const config = vscode.workspace.getConfiguration('free-ai-chat');
        const useModel = model || config.get('defaultModel') || 'openrouter/free';
        try {
            this.panel.webview.postMessage({ command: 'loading', isLoading: true });
            const response = await this.apiClient.sendChatMessage(this.messages, useModel);
            this.messages.push({ role: 'assistant', content: response });
            this.panel.webview.postMessage({
                command: 'response',
                content: response,
                model: useModel
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`AI Chat error: ${error.message}`);
            this.panel.webview.postMessage({
                command: 'error',
                message: error.message
            });
        }
        finally {
            this.panel.webview.postMessage({ command: 'loading', isLoading: false });
        }
    }
    async sendModelList(webview) {
        try {
            const models = await this.apiClient.listModels();
            webview.postMessage({ command: 'modelList', models });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to get models: ${error.message}`);
        }
    }
    async insertResponse(text) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, text);
            });
        }
    }
    getSelectedText() {
        const editor = vscode.window.activeTextEditor;
        if (editor && !editor.selection.isEmpty) {
            return editor.document.getText(editor.selection);
        }
        return undefined;
    }
    getFileContext() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.document.getText();
        }
        return undefined;
    }
    async askAboutSelection() {
        const selection = this.getSelectedText();
        if (!selection) {
            vscode.window.showInformationMessage('Please select some text to ask about.');
            return;
        }
        this.openChatPanel();
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'preload',
                text: `What does this code do?\n\n\`\`\`${this.getFileLanguage()}\n${selection}\n\`\`\``
            });
        }
    }
    async explainCode() {
        const selection = this.getSelectedText();
        if (!selection) {
            vscode.window.showInformationMessage('Please select code to explain.');
            return;
        }
        this.openChatPanel();
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'preload',
                text: `Explain this code in detail:\n\n\`\`\`${this.getFileLanguage()}\n${selection}\n\`\`\``
            });
        }
    }
    async generateCode() {
        const selection = this.getSelectedText();
        this.openChatPanel();
        if (this.panel) {
            const prompt = selection
                ? `Generate code based on this description:\n\n${selection}`
                : 'Please describe what code you want me to generate.';
            this.panel.webview.postMessage({
                command: 'preload',
                text: prompt
            });
        }
    }
    async refactorCode() {
        const selection = this.getSelectedText();
        if (!selection) {
            vscode.window.showInformationMessage('Please select code to refactor.');
            return;
        }
        const language = this.getFileLanguage();
        this.openChatPanel();
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'preload',
                text: `Refactor and improve this ${language} code:\n\n\`\`\`${language}\n${selection}\n\`\`\``
            });
        }
    }
    getFileLanguage() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const languageId = editor.document.languageId;
            const languageMap = {
                'javascript': 'javascript',
                'typescript': 'typescript',
                'python': 'python',
                'java': 'java',
                'csharp': 'csharp',
                'cpp': 'cpp',
                'go': 'go',
                'rust': 'rust',
                'html': 'html',
                'css': 'css',
                'json': 'json',
                'markdown': 'markdown'
            };
            return languageMap[languageId] || languageId;
        }
        return 'plaintext';
    }
}
exports.ChatProvider = ChatProvider;
//# sourceMappingURL=chat-provider.js.map