import * as vscode from 'vscode';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export class OpenRouterClient {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async sendChatMessage(messages: ChatMessage[], model: string): Promise<string> {
    const response = await fetch(`${this.endpoint}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'send_chat_message',
          arguments: {
            messages,
            model,
            apiKey: this.apiKey
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Unknown error');
    }

    return data.result?.content?.[0]?.text || '';
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${this.endpoint}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'list_chat_models'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.result?.content?.[0]?.text;
    
    return models ? JSON.parse(models) : [];
  }

  async getStatus(): Promise<any> {
    const response = await fetch(`${this.endpoint}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: 'get_chat_status'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    const data = await response.json();
    const status = data.result?.content?.[0]?.text;
    
    return status ? JSON.parse(status) : {};
  }

  isAuthenticated(): boolean {
    return !!this.apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }
}