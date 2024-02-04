import * as vscode from 'vscode';
import { branch } from './commands/branch.command';
import { pasteImage } from './commands/paste.command';
import { ImagesPanelViewProvider } from './commands/images.panel';
import { Globals } from './globals';
import { translate } from './commands/translate.command';

export async function activate(context: vscode.ExtensionContext) {

	// <ImagesPanel>
    const provider = Globals.imagesPanelProvider = new ImagesPanelViewProvider(context.extensionUri);
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
    
    // <Translate>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.translate', async () => {
        await translate();
    }));
	// </Translate>
}
