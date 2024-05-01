import * as vscode from 'vscode';
import * as fs from 'fs';
import DreamScriptCompiler from './dreamscript.compiler';

export async function clearTranslations() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
		await editor.document.save();
		const dreamFilePath = editor.document.uri.fsPath;
		const content = fs.readFileSync(dreamFilePath, 'utf8');

        const compiler = new DreamScriptCompiler(content);
        const clearedContent = compiler.clearTranslations();

        fs.writeFileSync(dreamFilePath, clearedContent.prompt);
        editor.document.save(); // Trigger save event for other extensions

        vscode.window.showInformationMessage('🧹 Translations were cleared !');
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}
