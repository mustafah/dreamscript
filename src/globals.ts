import { ImagesPanelViewProvider } from './commands/images.panel';
import * as vscode from 'vscode';

export class Globals {
    public static imagesPanelProvider: ImagesPanelViewProvider | null = null;
    public static extensionContext : vscode.ExtensionContext | null = null;
}
