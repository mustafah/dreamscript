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
            if (isUrl) {
                // Handle image URL
                const response = await axios.get(clipboardContent, { responseType: 'stream' });
                response.data.pipe(fs.createWriteStream(imagePath));
            } else {
                // Handle image data copied to clipboard
                // Note: This requires additional logic to retrieve image data from clipboard
                // Example: const imageData = await getImageDataFromClipboard();
                // fs.writeFileSync(imagePath, imageData);
                vscode.window.showErrorMessage('Handling of direct image data not implemented.');
                return;
            }

            const dreamFilePath = editor.document.uri.fsPath;
            if (fs.existsSync(dreamFilePath)) {
                let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');
                const outputRegex = /(~\s*images\s*=)([^\n]*)/i;
                const match = dreamFileContent.match(outputRegex);
                if (match) {
                    dreamFileContent = dreamFileContent.replace(outputRegex, `$1${match[2].trim() ? match[2] + ',' : ''}${imageFileName}`);
                } else {
                    dreamFileContent += `\n~images=${imageFileName}`;
                }
                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Image added: ${imageFileName}`);
                Globals.imagesPanelProvider?.updateWebviewContent(dreamFileContent);
            } else {
                vscode.window.showErrorMessage('Dream file not found.');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Failed to process the image.');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}
