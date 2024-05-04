import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Configs } from "./configs";
import { translateGoogle } from "./translate.google";
import DreamScriptCompiler, { separators } from "./dreamscript.compiler";
import { getAbbreviation } from "./translate.languages";
import emojiStrip from "emoji-strip";

export async function clearTranslations() {

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const inputString = fs.readFileSync(dreamFilePath, 'utf8');


    const result: string[] = [];
    const lines = inputString.split('\n');
    const compiler = new DreamScriptCompiler();
    
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
            
                if (compiler.isTranslateLine(nextNonEmptyLine)) {
                    i = j;
                }
            }
        }
    }

    const content = result.join('\n');

    fs.writeFileSync(dreamFilePath, content);
}
