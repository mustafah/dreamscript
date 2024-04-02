import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Configs } from "./configs";


export async function translateCommand() {
    const maxLength: number = 160;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const inputString = fs.readFileSync(dreamFilePath, 'utf8');


    const result: string[] = [];
    const lines = inputString.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('~') || trimmedLine.startsWith('//') || trimmedLine.trim() === '') {
            result.push(line);
        } else {
            const regex = /(?<=[.?!,:;])\s+/;
            const fragments = line.split(regex);
            let currentLine = '';

            for (let fragment of fragments) {
                fragment = fragment.trim();
                if (currentLine.length + fragment.length > maxLength) {
                    result.push(currentLine);
                    result.push(`~ [TRANSLATED_LINE]\n`); // Add translated line
                    currentLine = fragment;
                } else {
                    currentLine += (currentLine.length > 0 ? ' ' : '') + fragment;
                }
            }

            if (currentLine.length > 0) {
                result.push(currentLine);
                result.push(`~ [TRANSLATED_LINE]`); // Add translated line
            }
        }
    }

    const content = result.join('\n');

    const language = await Configs.getConfig('translationLanguage', 'Enter your preferred translation language name (e.g., French, Arabic, Spanish !)');
    const question = translateCommandTemplate({ content, language });

    const backendChoice = await Configs.getConfig('llmBackend');

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `🇺🇳 Translating using ${backendChoice}...`,
        cancellable: false
    }, async (progress) => {
        // Perform the translation
        try {
            const response = await llm(question);
            fs.writeFileSync(dreamFilePath, response);

        } catch (error) {
            vscode.window.showErrorMessage(`Error during translation: ${error}`);
        }
    });
}
