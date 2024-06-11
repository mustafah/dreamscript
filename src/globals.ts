import { ImagesPanelViewProvider } from './commands/images.panel';
import * as vscode from 'vscode';
import { LLMPanelViewProvider } from './commands/llm.panel';

export class Globals {
    public static imagesPanelProvider: ImagesPanelViewProvider | null = null;
    public static llmPanelProvider: LLMPanelViewProvider | null = null;
    public static extensionContext : vscode.ExtensionContext | null = null;
    public static llmConversation = [{
        role: 'user',
        content: 'Can you give me more variations on this ?'
    },
    {
        role: 'llm',
        content: 'Here is 1, 2 and three ..'
    }
    ];
}
