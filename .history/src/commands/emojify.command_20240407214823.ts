import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Configs } from "./configs";
import { emojifyCommandTemplate } from "./emojify.template";
import DreamScriptCompiler from "./dreamscript.compiler";
import emojiStrip from "emoji-strip";

export const separators  = /[.,;]+$/;
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

export async function emojifyCommand() {

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const inputString = fs.readFileSync(dreamFilePath, 'utf8');

    const emojis = {};
    const result: string[] = [];
    const lines = inputString.split('\n');
    const compiler = new DreamScriptCompiler();
    // const language = await Configs.getConfig('translationLanguage', 'Enter your preferred translation language name (e.g., French, Arabic, Spanish !)');
    // const languageAbbreviation = await getAbbreviation(language);
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.trim();
        if (line.startsWith('//') || line.trim() === '') {
            result.push(line);
        } else {
            if (compiler.processScriptLine(line)) {
                result.push(line);
            } else {
                line = line.replace(separators, ',');
                const emojiIndex = Object.keys(emojis).length;
                result.push(`~#${emojiIndex}# ${line}`);
                const cleanLine = emojiStrip(line).trim();
                emojis[cleanLine] = '';
            }
        }
    }

    const content = result.join('\n');

    // fs.writeFileSync(dreamFilePath, content);

    const emojisJSON = JSON.stringify(emojis);
	const question = emojifyCommandTemplate({emojisJSON});
    
    const backendChoice = await Configs.getConfig('llmBackend');

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `☺ Emojify using ${backendChoice}...`,
        cancellable: false
    }, async (progress) => {
        // Perform the translation
        try {
            const response = await llm(question);
            // fs.writeFileSync(dreamFilePath, response);

        } catch (error) {
            vscode.window.showErrorMessage(`Error during emojify: ${error}`);
        }

    });
}
