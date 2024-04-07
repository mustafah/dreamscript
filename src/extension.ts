import * as vscode from 'vscode';
import { branch } from './commands/branch.command';
import { pasteImage } from './commands/paste-images.command';
import { ImagesPanelViewProvider } from './commands/images.panel';
import { Globals } from './globals';
import { translateCommand } from './commands/translate.command';
import { emojify, emojifyCommand } from './commands/emojify.command';
import { promptify } from './commands/promptify.command';
import { Keys } from './commands/keys';
import { selectLLMBackend } from './commands/selectLLMBackend';
import { compileCommand } from './commands/compile.command';
import { formatCommand } from './commands/format.command';
import { exportCommand } from './commands/export.command';
import { pasteParameters } from './commands/paste-parameters.command';

export async function activate(context: vscode.ExtensionContext) {

	// <ImagesPanel>
    Globals.extensionContext = context;
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
    
    // <PasteParameters>
    const pasteParametersDisposable = vscode.commands.registerCommand('dreamscript.pasteParameters', async () => {
        await pasteParameters();
    });
    context.subscriptions.push(pasteImageDisposable);
	// </PasteParameters>

    // <Translate>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.translate', async () => {
        await translateCommand();
    }));
	// </Translate>

    // <Emojify>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.emojify', async () => {
        // await emojify();
        await emojifyCommand();
    }));
	// </Emojify>

    // <Promptify>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.promptify', async () => {
        await promptify();
    }));
	// </Promptify>

    // <ClearKeys>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.clearKeys', async () => {
        await Keys.removeKey('OPENAI_API_KEY');
    }));
	// </ClearKeys>

    // <LLM Backend>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.selectLLMBackend', async () => {
        selectLLMBackend();
    }));
    // </LLM Backend>

    // <Compile>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.compile', async () => {
        compileCommand();
    }));
    // </Compile>

    // <Format>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.format', async () => {
        formatCommand();
    }));
    // </Format>

    // <Export>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.export', async () => {
        exportCommand(false);
    }));
    // </Export>

    // <Export>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.exportWithPassword', async () => {
        exportCommand(true);
    }));
    // </Export>
}
