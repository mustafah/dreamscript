import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Configs } from "./configs";
import { translateGoogle } from "./translate.google";
import DreamScriptCompiler, { separators } from "./dreamscript.compiler";
import { getAbbreviation } from "./translate.languages";
import emojiStrip from "emoji-strip";

export async function translateCommand() {

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const inputString = fs.readFileSync(dreamFilePath, 'utf8');


    const result: string[] = [];
    const lines = inputString.split('\n');
    const compiler = new DreamScriptCompiler();
    const language = await Configs.getConfig('translationLanguage', 'Enter your preferred translation language name (e.g., French, Arabic, Spanish !)');
    const languageAbbreviation = await getAbbreviation(language);
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        line = line.trim();
        if (line.startsWith('//') || line.trim() === '') {
            result.push(line);
        } else {
            if (compiler.processScriptLine(line)) {
                result.push(line);
            } else {
                let nextNonEmptyLine: string = '';
                let j = i + 1;
                for (; j < lines.length; j++) {
                    nextNonEmptyLine = lines[j].trim();
                    if (nextNonEmptyLine !== '') {
                        break;
                    }
                }
                line = line.replace(separators, ',');
                result.push(line);
                
                const cleanLine = emojiStrip(line).trim();
                const translation = await translateGoogle(cleanLine.replace(',', ''), languageAbbreviation);
                if (compiler.isTranslateLine(nextNonEmptyLine)) {
                    i = j;
                }
                result.push(`~ ${translation}`);
            }
        }
    }

    const content = result.join('\n');

    fs.writeFileSync(dreamFilePath, content);

    // const question = translateCommandTemplate({ content, language });

    // const backendChoice = await Configs.getConfig('llmBackend');

    // await vscode.window.withProgress({
    //     location: vscode.ProgressLocation.Notification,
    //     title: `🇺🇳 Translating using ${backendChoice}...`,
    //     cancellable: false
    // }, async (progress) => {
    //     // Perform the translation
    //     try {
    //         const response = await llm(question);
    //         fs.writeFileSync(dreamFilePath, response);

    //     } catch (error) {
    //         vscode.window.showErrorMessage(`Error during translation: ${error}`);
    //     }
    // });
}
