// imageDeletion.ts
import * as vscode from 'vscode';
import { IMAGES_REGEX } from './regex';
import * as fs from 'fs';

export async function deleteImage(imageName: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        await document.save();

        const dreamFilePath = document.uri.fsPath;
        if (fs.existsSync(dreamFilePath)) {
            let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');
            const match = dreamFileContent.match(IMAGES_REGEX);

            if (match && match[2]) {
                // Split the images string into an array, remove the image, and join back
                let imagesArray = match[2].split(',').map(s => s.trim());
                imagesArray = imagesArray.filter(img => img !== imageName);
                const newImagesString = imagesArray.join(', ');

                // Replace the old images string with the new one
                dreamFileContent = dreamFileContent.replace(IMAGES_REGEX, `$1 ${newImagesString}`);

                // Write the updated content back to the file
                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Image deleted: ${imageName}`);

                // Update the webview content if necessary
                // Globals.imagesPanelProvider?.updateWebviewContent(dreamFileContent);
            }
        } else {
            vscode.window.showErrorMessage('Dream file not found.');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}
