import * as vscode from 'vscode';
import { OpenRouterClient } from './openrouter-client';
export declare class ChatProvider {
    private panel;
    private context;
    private apiClient;
    private messages;
    constructor(context: vscode.ExtensionContext, apiClient: OpenRouterClient);
    openChatPanel(): void;
    private handleSend;
    private sendModelList;
    insertResponse(text: string): Promise<void>;
    private getSelectedText;
    private getFileContext;
    askAboutSelection(): Promise<void>;
    explainCode(): Promise<void>;
    generateCode(): Promise<void>;
    refactorCode(): Promise<void>;
    private getFileLanguage;
}
//# sourceMappingURL=chat-provider.d.ts.map