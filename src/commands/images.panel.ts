import * as vscode from 'vscode';
import { IMAGES_REGEX } from './regex';

export class ImagesPanelViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dreamscript.imagesView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
        // Listen for changes in any text document
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === event.document && event.document.languageId === 'dream') {
                this.updateWebviewContent(event.document);
            }
        });
    }

    public resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri,
                vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'images')
            ]
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

	private extractImagePaths(documentText: string): string[] {
        const imagePaths = [];
        const match = documentText.match(IMAGES_REGEX);
        if (match && match[2]) {
            const paths = match[2].split(',').map(path => path.trim());
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                const workspaceFolderUri = vscode.workspace.workspaceFolders[0].uri;
                return paths.map(path => vscode.Uri.joinPath(workspaceFolderUri, 'images', `${path}.png`).toString());
            }
        }
        return imagePaths;
    }

    private getHtmlForWebview(webview: vscode.Webview, imagePaths: string[]): string {

        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'masonry.pkgd.min.js');
        const masonryScriptUri = webview.asWebviewUri(scriptPathOnDisk);

        const imageTags = imagePaths.map(path => `
        ${path}
        <img src="${webview.asWebviewUri(vscode.Uri.parse(path))}" /><br/>`).join('');
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dreamscript Images</title>
                <script src="${masonryScriptUri}"></script>
            </head>
            <body>
                ${imageTags}
            </body>
            </html>
        `;
    }
}

