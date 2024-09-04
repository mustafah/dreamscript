import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IMAGES_REGEX } from './regex';
import { readMetadata } from './metadata';
import { promptForMetadata } from './prompt';
import { deleteImage } from './delete.command';
import { Globals } from '../globals';
import { llm } from './llm';

export class LLMPanelViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'dreamscript.llmView';
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
    
    public postMessage(message: any) {
        this._view.webview.postMessage(message);
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
            if (message.command === 'addMessage') this.addMessage(message.message);
            const response = await llm(message.message.content);
            console.log(response);
        });
        
    }

    private addMessage(newMessage: { role: string, content: string }) {
        Globals.llmConversation.push(newMessage);
        this.updateWebviewContent(""); // Refresh the webview with the new message
    }

    public async updateWebviewContent(documentOrString: vscode.TextDocument | string) {
        if (this._view) {
            const documentText = typeof documentOrString === 'string' 
            ? documentOrString 
            : documentOrString.getText();
            const imagePaths = this.extractImagePaths(documentText);
            this._view.webview.html = this.getHtmlForWebview(this._view.webview, imagePaths); // Reset to actual 

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

        const llmPanelScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'llm.panel.wvjs'));
        const stylesLLMUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'llm.css'));
        const stylesLLM2Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'llm2.css'));

        const contextScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'contextjs', 'context.min.js'));
        const stylesContextUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'contextjs', 'skins', 'hackerman.css'));


        const uniqueString = new Date().getTime();
        // Append unique string to each image path
        const imageTags = imagePaths.map(path => {
            const imagePathWithQuery = new URL(path);
            imagePathWithQuery.searchParams.set('v', uniqueString.toString());
            // return `<div class="grid-item"><img src="${webview.asWebviewUri(vscode.Uri.parse(imagePathWithQuery.href))}" /></div>`;

            const fileNameWithoutExtension = path.split('/').pop().split('.').slice(0, -1).join('.');

            return `<div class="grid-item">
            <img class="dream-image" src="${webview.asWebviewUri(vscode.Uri.parse(imagePathWithQuery.href))}" data-path="${fileNameWithoutExtension}" />
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
                <link href="${stylesLLMUri}" rel="stylesheet">
                <link href="${stylesLLM2Uri}" rel="stylesheet">
            </head>
            <body>
                <div class="llm-container">

                
                <div class="conversation">

                    ${Globals.llmConversation.map((message) => {
                        return `<div class="message">
                                ${message.role.toLocaleLowerCase() === 'dreamscript' ? `<div class="role">${message.role}</div>` : ``}
                                <div class="content ${message.role}">${message.content}</div>
                        </div>`;
                    }).join('')}

                    <pre class="streamed message"></pre>
                </div>


                <div id="chat-input">
                    <div id="file-input"></div>
                    <textarea id="query" placeholder=""></textarea>
                </div>

                </div>
                <link href="${stylesContextUri}" rel="stylesheet">
                <script src="${contextScriptUri}"></script>
                <!---->
                <script src="${llmPanelScriptUri}"></script>
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
