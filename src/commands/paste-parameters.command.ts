import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Globals } from '../globals';
import { execSync } from 'child_process';
import { IMAGES_REGEX } from './regex';



export async function pasteParameters() {

    //////
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        await editor.document.save();
        const clipboardContent = await vscode.env.clipboard.readText();

        try {

            const dreamFilePath = editor.document.uri.fsPath;
            if (fs.existsSync(dreamFilePath)) {
                let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');

                
                dreamFileContent = `${dreamFileContent}\n${convertParams(clipboardContent)}`;


                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Parameters added ...`);

                setTimeout(() => {
                    // Scroll vertically to the end
                    const endOfDocumentPosition = editor.document.lineAt(editor.document.lineCount - 1).range.end;
                    editor.selection = new vscode.Selection(endOfDocumentPosition, endOfDocumentPosition);
                    editor.revealRange(editor.selection);
                }, 100);

            } else {
                vscode.window.showErrorMessage('Dream file not found.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('☺️ Failed to paste a valid parameters');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}

function convertParams(input: string) {
    const lines = input.split('\n');
    const params: string[] = [];
    const keysToSpot = [
        'Input Resolution',
        'Created',
        'Pipeline',
        'Seed',
        'Preset',
        'PhotoReal',
        'Model',
        'Init Strength',
        'RAW Mode',
        'Prompt Magic',
        'High Contrast',
        'Finetuned Model'
    ];

    let currentValue = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
		if (!line) continue;
		console.log(`*'${line}'`);
        if (keysToSpot.includes(line)) {
            if (currentValue !== '') {
                params.push(currentValue);
                currentValue = '';
            }
            const valueLines: string[] = [];
            let j = i + 1;
            while (j < lines.length && !keysToSpot.includes(lines[j].trim())) {
				const value = lines[j].trim();
				if (value)
					valueLines.push(value);
                j++;
            }
            currentValue = `~ ${line} = ${valueLines.join(' ')}`;
            i = j - 1;
        }
    }

    if (currentValue !== '') {
        params.push(currentValue);
    }

    return params.join('\n');
}
