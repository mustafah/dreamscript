import * as vscode from 'vscode';
import * as fs from 'fs';

export async function formatCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
		await editor.document.save();
		const dreamFilePath = editor.document.uri.fsPath;
		const content = fs.readFileSync(dreamFilePath, 'utf8');

        await vscode.env.clipboard.writeText(content);
        
        vscode.window.showInformationMessage('Compiled prompt copied to clipboard !');
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}
