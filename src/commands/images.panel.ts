import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IMAGES_REGEX } from './regex';
import { readMetadata } from './metadata';
import { promptForMetadata } from './prompt';

export class ImagesPanelViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dreamscript.imagesView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {
        // Listen for changes in any text document
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === event.document && event.document.languageId === 'dreamscript') {
                this.updateWebviewContent(event.document);
            }
        });
        // Listen for active editor changes
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'dreamscript') {
                this.updateWebviewContent(editor.document.getText());
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
        if (activeEditor && activeEditor.document.languageId === 'dreamscript') {
            this.updateWebviewContent(activeEditor.document);
        }

        this._view.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'updateMetadata') this.updateMetadata(message);
            else if (message.command === 'openImage') this.openImage(message.path);
            else if (message.command === 'createOrOpenMetadata') {
                await this.createOrOpenMetadataFile(message.path);
            }
        });
        
    }

    
    private async createOrOpenMetadataFile(imageName) {
        const workspaceRoot = vscode.workspace.rootPath;
        const imageDir = path.join(workspaceRoot, 'images');

        // const imageDir = path.dirname(imagePath);
        // const imageName = path.basename(imagePath, path.extname(imagePath));
        const metaFilePath = path.join(imageDir, `${imageName}.metadata.txt`);

        const metaFileUri = vscode.Uri.file(metaFilePath);
    
        // Check if the file exists, if not create an empty file
        try {
            await vscode.workspace.fs.stat(metaFileUri);
        } catch (error) {
            await vscode.workspace.fs.writeFile(metaFileUri, new Uint8Array());
        }
    
        // Open the file in a new editor tab
        const document = await vscode.workspace.openTextDocument(metaFileUri);
        await vscode.window.showTextDocument(document);
    }

    // Function to open the image file
    private openImage(imagePath) {
        const imageUri = vscode.Uri.file(imagePath);
        // vscode.commands.executeCommand('vscode.open', imageUri);
        promptForMetadata();
    }
    private updateMetadata(message: any) {
        const workspaceRoot = vscode.workspace.rootPath;
        const metadataFilePath = path.join(workspaceRoot, 'images', 'metadata.json');
        
        let existingData = {};
    
        try {
            if (fs.existsSync(metadataFilePath)) {
                const fileContent = fs.readFileSync(metadataFilePath, 'utf8');
                existingData = JSON.parse(fileContent);
            }
        } catch (error) {
            console.error('Error reading or parsing metadata.json:', error);
            // Handle the error or notify the user as necessary
        }
    
        // Update with new data
        existingData[message.path] = { ...existingData[message.path], ...message.data };
    
        try {
            fs.writeFileSync(metadataFilePath, JSON.stringify(existingData, null, 2), 'utf8');
        } catch (error) {
            console.error('Error writing to metadata.json:', error);
        }
    }

    public async updateWebviewContent(documentOrString: vscode.TextDocument | string) {
        if (this._view) {
            const documentText = typeof documentOrString === 'string' 
            ? documentOrString 
            : documentOrString.getText();
            const imagePaths = this.extractImagePaths(documentText);
            this._view.webview.html = this.getHtmlForWebview(this._view.webview, imagePaths); // Reset to actual content

            const metadata = await readMetadata();
            this._view.webview.postMessage({ command: 'loadMetadata', data: metadata });
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
            // return `<div class="grid-item"><img src="${webview.asWebviewUri(vscode.Uri.parse(imagePathWithQuery.href))}" /></div>`;

            const fileNameWithoutExtension = path.split('/').pop().split('.').slice(0, -1).join('.');

            return `<div class="grid-item">
            <img src="${webview.asWebviewUri(vscode.Uri.parse(imagePathWithQuery.href))}" />
                <button class="favorite-btn" data-path="${fileNameWithoutExtension}">❤️</button>
                <button class="meta-btn" data-path="${fileNameWithoutExtension}">📝</button>
            </div>`;
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
