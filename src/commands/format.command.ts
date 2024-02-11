import * as vscode from 'vscode';
import * as fs from 'fs';
import { formatCommandTemplate } from './format.template';
import { Configs } from './configs';
import { llm } from './llm';

export async function formatCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
		await editor.document.save();
		const dreamFilePath = editor.document.uri.fsPath;
		const content = fs.readFileSync(dreamFilePath, 'utf8');

        const question = formatCommandTemplate({content});
        
        const backendChoice = await Configs.getConfig('llmBackend');

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `📝💡 Formatting using ${backendChoice}...`,
            cancellable: false
        }, async (progress) => {
            // Perform the translation
            try {
                const response = await llm(question);
                fs.writeFileSync(dreamFilePath, response);
    
            } catch (error) {
                vscode.window.showErrorMessage(`Error during emojify: ${error}`);
            }
        });
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}
