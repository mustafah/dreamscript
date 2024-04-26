import { llm } from "./llm";
import { colorizeCommandTemplate } from "./colorize.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Keys } from "./keys";
import { Configs } from "./configs";
import { emojifyCommandTemplate } from "./emojify.template";
import { promptifyCommandTemplate } from "./promptify.template";

export async function colorize() {
    const maxLength: number = 160;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const selection = editor.selection;
    let selectedText = editor.document.getText(selection);

    if (!selectedText) {
        vscode.window.showInformationMessage("No text selected. Please select text to colorize.");
        return;
    }
    
    // const maxLines = await Configs.getConfig('promptifyMaxLines');

	const question = colorizeCommandTemplate({content: selectedText});
    
    const backendChoice = await Configs.getConfig('llmBackend');
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `📝 Colorize using ${backendChoice}...`,
        cancellable: false
    }, async (progress) => {
        try {
            const response = await llm(question);
            let endPosition;
            await editor.edit((editBuilder) => {
                const startPosition = selection.start;
                const endPosition = selection.end;

                try {
                    const responseJson = JSON.parse(response.replace(/^```json/, '').replace(/```$/, ''));
                    const keys = Object.keys(responseJson);
                    keys.forEach(key => {
                        let k = key;
                        if (k.startsWith('#')) k = key.slice(1);
                        const regex = new RegExp('#?' + k, 'gi');
                        selectedText = selectedText.replace(regex, `"${responseJson[key]}"`);
                    });
                    editBuilder.replace(new vscode.Range(startPosition, endPosition), selectedText);
                } catch (error) {
                    // do nothing, if there's an error parsing the json, just use the raw response
                    vscode.window.showErrorMessage(`Error during color: ${error}`);
                }
            }).then(() => {
                // const newEndPosition = selection.end.translate(0, response.length + 1); // +1 for the newline character
                // const newSelection = new vscode.Selection(endPosition, newEndPosition);
                // editor.selection = newSelection;
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error during color: ${error}`);
        }
    });
}
