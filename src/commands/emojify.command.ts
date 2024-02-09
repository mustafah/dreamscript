import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Configs } from "./configs";
import { emojifyCommandTemplate } from "./emojify.template";

export async function emojify() {

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const content = fs.readFileSync(dreamFilePath, 'utf8');

	const question = emojifyCommandTemplate({content});
    
    const backendChoice = await Configs.getConfig('llmBackend');

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `☺ Emojify using ${backendChoice}...`,
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
}
