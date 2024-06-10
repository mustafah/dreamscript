import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Keys } from "./keys";
import { Configs } from "./configs";
import { emojifyCommandTemplate } from "./emojify.template";
import { promptifyCommandTemplate } from "./promptify.template";
import { customPromptifyCommandTemplate } from "./custom-promptify.template";

export async function customizedPromptify() {

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
        vscode.window.showInformationMessage("No text selected. Please select text to promptify.");
        return;
    }

    
    
    const maxLines = await Configs.getConfig('promptifyMaxLines');


    const promptQuery = await vscode.window.showInputBox({
        prompt: "Please enter the prompt query for this selection",
        // value: 'starting after [CONTENT], can you write a better prompt for midjourney or lenardoai, apply the following rules:\n\n* the new prompt should have {{ maxLines }} lines maximum\n* keep lines starting with ~ or // as is\n* Respond only with updated CONTENT\n* Ignore the CONTENT marker in your response',
    });
    if (!promptQuery) return;

	const question = customPromptifyCommandTemplate({promptQuery, content: selectedText, maxLines});
    
    const backendChoice = await Configs.getConfig('llmBackend');
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `📝 Promptify using ${backendChoice}...`,
        cancellable: false
    }, async (progress) => {
        try {
            const response = await llm(question);
            let endPosition;
            await editor.edit((editBuilder) => {
                const endPosition = selection.end;
                editBuilder.insert(endPosition, `\n💡 ${response}\n`);
            }).then(() => {
                // const newEndPosition = selection.end.translate(0, response.length + 1); // +1 for the newline character
                // const newSelection = new vscode.Selection(endPosition, newEndPosition);
                // editor.selection = newSelection;
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error during promptify: ${error}`);
        }
    });
}
