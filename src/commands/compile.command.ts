import * as vscode from 'vscode';
import * as fs from 'fs';
import DreamScriptCompiler from './dreamscript.compiler';

export async function compileCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
		await editor.document.save();
		const dreamFilePath = editor.document.uri.fsPath;
		const content = fs.readFileSync(dreamFilePath, 'utf8');

        const compiler = new DreamScriptCompiler(content);
        const compiledContent = compiler.compile();

        await vscode.env.clipboard.writeText(compiledContent.prompt);

        vscode.window.showInformationMessage('🌟✨🚀📋 Compiled prompt copied to clipboard !');
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}
