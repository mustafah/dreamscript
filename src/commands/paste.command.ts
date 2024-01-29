import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Globals } from '../globals';

export async function pasteImage() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        await editor.document.save();

        const clipboardContent = await vscode.env.clipboard.readText();

        const isUrl = /^https?:\/\//i.test(clipboardContent);

        if (!isUrl) {
            vscode.window.showErrorMessage('Clipboard does not contain a valid image URL.');
            return;
        }

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

        try {
            const response = await axios.get(clipboardContent, { responseType: 'stream' });
            response.data.pipe(fs.createWriteStream(imagePath));

            const dreamFilePath = editor.document.uri.fsPath;
            if (fs.existsSync(dreamFilePath)) {
                let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');

                // Regular expression to find the line starting with ~ output =
                // const outputRegex = /(~\s*images\s*=\s*)(.*)/;
                const outputRegex = /(~\s*images\s*=)([^\n]*)/i;

                const match = dreamFileContent.match(outputRegex);

                if (match) {
                    if (match[2].trim()) {
                        dreamFileContent = dreamFileContent.replace(outputRegex, `$1${imageFileName}, ${match[2]}`);
                    } else {
                        dreamFileContent = dreamFileContent.replace(outputRegex, `$1${match[2]}${imageFileName}`);
                    }
                } else {
                    // If no matching line, add a new line
                    dreamFileContent += `\n~ images = ${imageFileName}`;
                }

                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Image added: ${imageFileName}`);
                    
                Globals.imagesPanelProvider?.updateWebviewContent(dreamFileContent);
                
            } else {
                vscode.window.showErrorMessage('Dream file not found.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to download the image.');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}
