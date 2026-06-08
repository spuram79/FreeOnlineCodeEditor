export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface Model {
    id: string;
    name: string;
    description: string;
}
export declare class OpenRouterClient {
    private apiKey;
    private endpoint;
    constructor(apiKey: string, endpoint: string);
    setApiKey(key: string): void;
    sendChatMessage(messages: ChatMessage[], model: string): Promise<string>;
    listModels(): Promise<Model[]>;
    getStatus(): Promise<any>;
    isAuthenticated(): boolean;
    getApiKey(): string;
}
//# sourceMappingURL=openrouter-client.d.ts.map