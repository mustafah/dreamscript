import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function readMetadata(): Promise<any> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const workspacePath = workspaceFolders[0].uri.fsPath;
        const metadataPath = path.join(workspacePath, 'images', 'metadata.json');

        try {
            const data = await fs.promises.readFile(metadataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // console.error('Error reading metadata:', error);
            return {};
        }
    }
    return {};
}
