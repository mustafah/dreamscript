import * as vscode from 'vscode';
import { IMAGES_REGEX } from './regex';

export class ImagesPanelViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dreamscript.imagesView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
        // Listen for changes in the active text editor
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'dream') {
                this.updateWebviewContent(editor.document);
            }
        });
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        // Initialize with current active editor if it is a .dream file
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.languageId === 'dream') {
            this.updateWebviewContent(activeEditor.document);
        }
    }

    public updateWebviewContent(document: vscode.TextDocument) {
        if (this._view) {
            const imagePaths = this.extractImagePaths(document.getText());
            this._view.webview.html = this.getHtmlForWebview(this._view.webview, imagePaths);
        }
    }

    private extractImagePaths2(documentText: string): string[] {
        const imagePaths = [];
        const lines = documentText.split('\n');
        for (const line of lines) {
            if (line.startsWith('~ images =')) {
                const paths = line.substring(8).split(',').map(path => `images/${path.trim()}.png`);
                imagePaths.push(...paths);
            }
        }
        return imagePaths;
    }

	private extractImagePaths(documentText: string): string[] {
        const imagePaths = [];
        const match = documentText.match(IMAGES_REGEX);
        if (match && match[2]) {
            const paths = match[2].split(',').map(path => path.trim());
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const workspacePath = workspaceFolders[0].uri.fsPath;
                return paths.map(path => vscode.Uri.file(path).fsPath);
            }
        }
        return imagePaths;
    }

    private getHtmlForWebview(webview: vscode.Webview, imagePaths: string[]): string {
        const imageTags = imagePaths.map(path => 
            `<img src="${webview.asWebviewUri(vscode.Uri.file(path))}" />`
        ).join('');
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dreamscript Images</title>
            </head>
            <body>
                ${imageTags}
            </body>
            </html>
        `;
    }
}

