import * as vscode from 'vscode';
import { OpenRouterClient } from './openrouter-client';
import { ChatProvider } from './chat-provider';

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('free-ai-chat');
  
  // Initialize OpenRouter client
  const apiClient = new OpenRouterClient(
    config.get<string>('apiKey') || '',
    config.get<string>('endpoint') || 'https://sb-30apv2h137ht.vercel.run'
  );
  
  // Register chat panel provider
  const chatProvider = new ChatProvider(context, apiClient);
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.openChat', () => {
      chatProvider.openChatPanel();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.askSelection', () => {
      chatProvider.askAboutSelection();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.explainCode', () => {
      chatProvider.explainCode();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.generateCode', () => {
      chatProvider.generateCode();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.refactorCode', () => {
      chatProvider.refactorCode();
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('free-ai-chat.insertResponse', (response: string) => {
      chatProvider.insertResponse(response);
    })
  );
  
  // Register tree view for activity bar
  const treeDataProvider = new ChatTreeDataProvider();
  vscode.window.createTreeView('free-ai-chat.activities', {
    treeDataProvider,
    showCollapseAll: false
  });
  
  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('free-ai-chat.apiKey')) {
        const newKey = config.get<string>('apiKey') || '';
        apiClient.setApiKey(newKey);
      }
    })
  );
}

export function deactivate() {}

// Tree data provider for activity bar
class ChatTreeDataProvider implements vscode.TreeDataProvider<ChatItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(element: ChatItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ChatItem[] {
    return [
      new ChatItem(
        'Open New Chat',
        'Open the AI chat panel',
        vscode.TreeItemCollapsibleState.None,
        'free-ai-chat.openChat'
      ),
      new ChatItem(
        'Ask About Selection',
        'Ask AI about selected code',
        vscode.TreeItemCollapsibleState.None,
        'free-ai-chat.askSelection'
      ),
      new ChatItem(
        'Explain Code',
        'Get explanation for selected code',
        vscode.TreeItemCollapsibleState.None,
        'free-ai-chat.explainCode'
      ),
      new ChatItem(
        'Generate Code',
        'Generate code from description',
        vscode.TreeItemCollapsibleState.None,
        'free-ai-chat.generateCode'
      ),
      new ChatItem(
        'Refactor Code',
        'Improve selected code',
        vscode.TreeItemCollapsibleState.None,
        'free-ai-chat.refactorCode'
      )
    ];
  }
}

class ChatItem extends vscode.TreeItem {
  constructor(
    label: string,
    tooltip: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    command?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
    this.command = command ? {
      command,
      title: label,
      tooltip: tooltip
    } : undefined;
  }
}