import * as vscode from 'vscode';
import { OpenRouterClient, ChatMessage } from './openrouter-client';
import { getWebviewContent } from './webview-content';

export class ChatProvider {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private apiClient: OpenRouterClient;
  private messages: ChatMessage[] = [];

  constructor(context: vscode.ExtensionContext, apiClient: OpenRouterClient) {
    this.context = context;
    this.apiClient = apiClient;
  }

  openChatPanel() {
    const config = vscode.workspace.getConfiguration('free-ai-chat');
    const panel = vscode.window.createWebviewPanel(
      'freeAiChat',
      'Free AI Chat',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          this.context.extensionUri
        ]
      }
    );

    this.panel = panel;
    this.messages = [];

    panel.webview.html = getWebviewContent(panel.webview, this.context.extensionUri);

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
            endpoint: config.get<string>('endpoint'),
            model: config.get<string>('defaultModel')
          });
          break;
      }
    });

    // Handle panel disposal
    panel.onDidDispose(() => {
      this.panel = undefined;
    });
  }

  private async handleSend(text: string, model: string) {
    if (!this.panel) return;

    if (!this.apiClient.isAuthenticated()) {
      vscode.window.showErrorMessage('Please set your OpenRouter API key in settings (free-ai-chat.apiKey)');
      this.panel.webview.postMessage({ command: 'apiKeyRequired' });
      return;
    }

    this.messages.push({ role: 'user', content: text });
    
    const config = vscode.workspace.getConfiguration('free-ai-chat');
    const useModel = model || config.get<string>('defaultModel') || 'openrouter/free';

    try {
      this.panel.webview.postMessage({ command: 'loading', isLoading: true });
      
      const response = await this.apiClient.sendChatMessage(
        this.messages,
        useModel
      );

      this.messages.push({ role: 'assistant', content: response });
      
      this.panel.webview.postMessage({
        command: 'response',
        content: response,
        model: useModel
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`AI Chat error: ${error.message}`);
      this.panel.webview.postMessage({
        command: 'error',
        message: error.message
      });
    } finally {
      this.panel.webview.postMessage({ command: 'loading', isLoading: false });
    }
  }

  private async sendModelList(webview: vscode.Webview) {
    try {
      const models = await this.apiClient.listModels();
      webview.postMessage({ command: 'modelList', models });
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to get models: ${error.message}`);
    }
  }

  async insertResponse(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, text);
      });
    }
  }

  private getSelectedText(): string | undefined {
    const editor = vscode.window.activeTextEditor;
    if (editor && !editor.selection.isEmpty) {
      return editor.document.getText(editor.selection);
    }
    return undefined;
  }

  private getFileContext(): string | undefined {
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

  private getFileLanguage(): string {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const languageId = editor.document.languageId;
      const languageMap: Record<string, string> = {
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