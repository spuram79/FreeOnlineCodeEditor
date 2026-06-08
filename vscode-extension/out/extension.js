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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const openrouter_client_1 = require("./openrouter-client");
const chat_provider_1 = require("./chat-provider");
function activate(context) {
    const config = vscode.workspace.getConfiguration('free-ai-chat');
    // Initialize OpenRouter client
    const apiClient = new openrouter_client_1.OpenRouterClient(config.get('apiKey') || '', config.get('endpoint') || 'https://sb-30apv2h137ht.vercel.run');
    // Register chat panel provider
    const chatProvider = new chat_provider_1.ChatProvider(context, apiClient);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.openChat', () => {
        chatProvider.openChatPanel();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.askSelection', () => {
        chatProvider.askAboutSelection();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.explainCode', () => {
        chatProvider.explainCode();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.generateCode', () => {
        chatProvider.generateCode();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.refactorCode', () => {
        chatProvider.refactorCode();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('free-ai-chat.insertResponse', (response) => {
        chatProvider.insertResponse(response);
    }));
    // Register tree view for activity bar
    const treeDataProvider = new ChatTreeDataProvider();
    vscode.window.createTreeView('free-ai-chat.activities', {
        treeDataProvider,
        showCollapseAll: false
    });
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('free-ai-chat.apiKey')) {
            const newKey = config.get('apiKey') || '';
            apiClient.setApiKey(newKey);
        }
    }));
}
function deactivate() { }
// Tree data provider for activity bar
class ChatTreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        return [
            new ChatItem('Open New Chat', 'Open the AI chat panel', vscode.TreeItemCollapsibleState.None, 'free-ai-chat.openChat'),
            new ChatItem('Ask About Selection', 'Ask AI about selected code', vscode.TreeItemCollapsibleState.None, 'free-ai-chat.askSelection'),
            new ChatItem('Explain Code', 'Get explanation for selected code', vscode.TreeItemCollapsibleState.None, 'free-ai-chat.explainCode'),
            new ChatItem('Generate Code', 'Generate code from description', vscode.TreeItemCollapsibleState.None, 'free-ai-chat.generateCode'),
            new ChatItem('Refactor Code', 'Improve selected code', vscode.TreeItemCollapsibleState.None, 'free-ai-chat.refactorCode')
        ];
    }
}
class ChatItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.command = command ? {
            command,
            title: label,
            tooltip: tooltip
        } : undefined;
    }
}
//# sourceMappingURL=extension.js.map