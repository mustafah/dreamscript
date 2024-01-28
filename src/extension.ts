import * as vscode from 'vscode';
import { branch } from './commands/branch.command';
import { pasteImage } from './commands/paste.command';
import { ImagesPanelViewProvider } from './commands/images.panel';

export function activate(context: vscode.ExtensionContext) {

	// <ImagesPanel>
	const provider = new ImagesPanelViewProvider(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ImagesPanelViewProvider.viewType, provider));
	// </ImagesPanel>
	
    // <Branch>
    const branchDisposable = vscode.commands.registerCommand('dreamscript.branch', async () => {
        await branch();
    });
    context.subscriptions.push(branchDisposable);
	// </Branch>

    // <PasteImage>
    const pasteImageDisposable = vscode.commands.registerCommand('dreamscript.pasteImage', async () => {
        await pasteImage();
    });
    context.subscriptions.push(pasteImageDisposable);
	// </PasteImage>
}
