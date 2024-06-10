import { ImagesPanelViewProvider } from './commands/images.panel';
import * as vscode from 'vscode';
import { LLMPanelViewProvider } from './commands/llm.panel';

export class Globals {
    public static imagesPanelProvider: ImagesPanelViewProvider | null = null;
    public static llmPanelProvider: LLMPanelViewProvider | null = null;
    public static extensionContext : vscode.ExtensionContext | null = null;
}
