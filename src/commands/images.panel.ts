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

    public updateWebviewContent(documentOrString: vscode.TextDocument | string) {
        if (this._view) {
            const documentText = typeof documentOrString === 'string' 
            ? documentOrString 
            : documentOrString.getText();
            const imagePaths = this.extractImagePaths(documentText);
            this._view.webview.html = this.getHtmlForWebview(this._view.webview, imagePaths); // Reset to actual content
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

        const masonryScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'masonry.pkgd.min.js'));
        const imagesPanelScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'images.panel.js'));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
        const imagesloadedScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'imagesloaded.pkgd.min.js'));
        const uniqueString = new Date().getTime();
        // Append unique string to each image path
        const imageTags = imagePaths.map(path => {
            const imagePathWithQuery = new URL(path);
            imagePathWithQuery.searchParams.set('v', uniqueString.toString());
            return `<div class="grid-item"><img src="${webview.asWebviewUri(vscode.Uri.parse(imagePathWithQuery.href))}" /></div>`;
        }).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dreamscript Images</title>
                <link href="${stylesMainUri}" rel="stylesheet">
                <script src="${imagesloadedScriptUri}"></script>
                <script src="${masonryScriptUri}"></script>
            </head>
            <body>
                <div class="grid">
                    ${imageTags}
                </div>
                <script src="${imagesPanelScriptUri}"></script>
            </body>
            </html>
        `;
    }
}

function forceReflowWebview(webviewPanel) {
    const originalContent = webviewPanel.webview.html;
    webviewPanel.webview.html = '<html><body>Reloading...</body></html>';
    setTimeout(() => {
        webviewPanel.webview.html = originalContent;
    }, 100); // Delay can be adjusted
}
