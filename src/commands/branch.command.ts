import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { emojis } from './emojis';


export async function branch() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        
        const document = editor.document;
        const originalFilePath = document.uri.fsPath;
        const originalFileDir = path.dirname(originalFilePath);
        const originalFileName = path.basename(originalFilePath);
        const fileExtension = path.extname(originalFileName);
        const baseName = path.basename(originalFileName, fileExtension);

        // Function to get a random emoji
        const getRandomEmoji = (lastIndex = -1) => {
            let index;
            do {
                index = Math.floor(Math.random() * emojis.length);
            } while (index === lastIndex && emojis.length > 1); // Ensure a different emoji if possible
            return emojis[index];
        };

        // Create new file path with emoji
        let emojiIndex = -1;
        let newFilePath;
        do {
            let emoji = getRandomEmoji(emojiIndex);
            emojiIndex = emojis.indexOf(emoji); // Store the last used emoji index
            newFilePath = path.join(originalFileDir, `${baseName}.${emoji}${fileExtension}`);
        } while (fs.existsSync(newFilePath));

        // Copy file content to new file
        const fileContent = fs.readFileSync(originalFilePath, 'utf8');
        fs.writeFileSync(newFilePath, fileContent);

        vscode.window.showInformationMessage(`Branch created: ${path.basename(newFilePath)}`);

    } else {
        vscode.window.showErrorMessage("No active editor found for creating a branch.");
    }
}
