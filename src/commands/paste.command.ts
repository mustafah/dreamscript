import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Globals } from '../globals';
import { execSync } from 'child_process';
import { IMAGES_REGEX } from './regex';



export async function pasteImage() {

    //////
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        await editor.document.save();
        const clipboardContent = await vscode.env.clipboard.readText();
        const isUrl = /^https?:\/\//i.test(clipboardContent);

        const imagesDir = path.join(vscode.workspace.rootPath as string, 'images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir);
        }

        let imageIndex = 1;
        let imageFileName = `image${imageIndex}`;
        while (fs.existsSync(path.join(imagesDir, `${imageFileName}.png`))) {
            imageIndex++;
            imageFileName = `image${imageIndex}`;
        }

        const imagePath = path.join(imagesDir, `${imageFileName}.png`);
        const isMacOS = process.platform === 'darwin'; // Check if the system is macOS

        try {
            if (isUrl) {
                // Handle image URL
                const response = await axios.get(clipboardContent, { responseType: 'stream' });
                response.data.pipe(fs.createWriteStream(imagePath));
            } else if (isMacOS) {
                execSync(`pbimage "${imagePath}"`);
            } else {
                vscode.window.showErrorMessage('Direct image paste is not supported on this system.');
                return;
            }

            const dreamFilePath = editor.document.uri.fsPath;
            if (fs.existsSync(dreamFilePath)) {
                let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');
                const outputRegex = IMAGES_REGEX;
                const match = dreamFileContent.match(outputRegex);

                if (match) {
                    dreamFileContent = dreamFileContent.replace(outputRegex, `$1 ${imageFileName}, ${match[2].trim()}`);
                } else {
                    dreamFileContent = `\n~images = ${imageFileName}` + dreamFileContent;
                }


                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Image added: ${imageFileName}`);
                Globals.imagesPanelProvider?.updateWebviewContent(dreamFileContent);

                // Save the current dream file content as a snapshot
                const originalPath = path.join(imagesDir, `${imageFileName}.original.dream`);
                fs.writeFileSync(originalPath, dreamFileContent);

            } else {
                vscode.window.showErrorMessage('Dream file not found.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('☺️ Failed to paste a valid image or image URL');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}
