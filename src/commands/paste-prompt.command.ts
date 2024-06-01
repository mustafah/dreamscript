import * as vscode from 'vscode';
import * as fs from 'fs';

export async function pastePrompt() {

    //////
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        await editor.document.save();
        const clipboardContent = await vscode.env.clipboard.readText();

        try {

            const dreamFilePath = editor.document.uri.fsPath;
            if (fs.existsSync(dreamFilePath)) {
                let dreamFileContent = fs.readFileSync(dreamFilePath, 'utf8');

                
                dreamFileContent = `${dreamFileContent}\n${formatPrompt(clipboardContent)}`;


                fs.writeFileSync(dreamFilePath, dreamFileContent);
                vscode.window.showInformationMessage(`Prompt added ...`);

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
            vscode.window.showErrorMessage('☺️ Failed to paste a prompt');
        }
    } else {
        vscode.window.showErrorMessage('No active editor found.');
    }
}

function formatPrompt(input: string) {
    
    return input.split(/[.,;]/)
        .map(line => line.trim())
        .filter(line => !line.match(/^\{.*\}$/))
        .filter(line => line.length > 0).join(',\n');

}
