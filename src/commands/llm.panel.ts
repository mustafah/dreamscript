import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IMAGES_REGEX } from "./regex";
import { readMetadata } from "./metadata";
import { promptForMetadata } from "./prompt";
import { deleteImage } from "./delete.command";
import { Globals } from "../globals";
import { llm } from "./llm";
import { marked } from "marked";

export class LLMPanelViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "dreamscript.llmView";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.loadConversationFromFile().then((data) => {
      this.updateWebviewContent();
    });
  }

  public postMessage(message: any) {
    this._view.webview.postMessage(message);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "images"),
      ],
    };
    // Initialize with current active editor if it is a .dream file
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === "dreamscript") {
      this.updateWebviewContent();
    }
    this._view.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "storeLLMResponse") {
        const llmResponse: { question: string, answer: {model: string, content: string}, context: any } = message.message;
        Globals.currentStreamContext = llmResponse.context;
        Globals.currentConversation.push(new QuestionAndAnswer(llmResponse));
        await this.saveConversationToFile();
        console.log(Globals.currentConversation);
      } else if (message.command === "askLLM") {
        const question = message.message.content;
        // Globals.llmConversation.push({role: "dreamscript", content: question});
        const response = await llm(question);
        new QuestionAndAnswer({
          question: question
        }).AddToPanel();
        // this.updateWebviewContent("");
      } else if (message.command === "insertText") {
        const text = message.message.content;
        this.insertTextAtCursor(text);
      }
    });
  }

  private insertTextAtCursor(text: string) {
    text = "\n" + text + "\n";
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      console.error("Active editor not found.");
      return;
    }
  
    const edit = activeEditor.edit(builder => {
      // Get the current cursor position
      const selection = activeEditor.selection;
      const position = selection.active;
  
      // Insert the text at the cursor position
      builder.insert(position, text);
    });
    edit.then(() => {
      vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
      console.log("Text inserted successfully!");
    }, (error) => {
      console.error("Error inserting text:", error);
    });
  }

  private async saveConversationToFile() {
    try {
      const conversation = Globals.currentConversation;
      const context = Globals.currentStreamContext;

      const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "dreamproj", "llm");
      const directoryPath = path.dirname(filePath.fsPath);
      if (!fs.existsSync(directoryPath)) {
        await fs.promises.mkdir(directoryPath, { recursive: true });
      }
      const llmContent = {
        conversation,
        meta: {
          context
        }
      };
      const fileContent = JSON.stringify(llmContent, null, 2);  // Stringify with indentation
      await fs.promises.writeFile(filePath.fsPath, fileContent);
      console.log("LLM conversation saved successfully!");
    } catch (error) {
      console.error("Error saving LLM conversation:", error);
      // Handle errors appropriately, e.g., display a user notification
    }
  }

  private async loadConversationFromFile() {
    try {
      const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, "dreamproj", "llm");
      if (!fs.existsSync(filePath.fsPath)) {
        console.warn("LLM conversation file not found.");
        return null;
      }
  
      const fileContent = await fs.promises.readFile(filePath.fsPath, 'utf8');
      const loadedLLM = JSON.parse(fileContent);
      Globals.currentStreamContext = loadedLLM.meta?.context;
      if (loadedLLM.conversation?.length)
        Globals.currentConversation = loadedLLM.conversation.map((conv) => new QuestionAndAnswer(conv));
      // Ensure the loaded conversation is an array
      if (!Array.isArray(Globals.currentConversation)) {
        console.error("Invalid LLM conversation data.");
        return null;
      }
      return Globals.currentConversation;
    } catch (error) {
      console.error("Error loading LLM conversation:", error);
      return null;
    }
  }

  private addMessage(newMessage: { role: string; content: string }) {}

  public async updateWebviewContent() {
    if (this._view) {
      this._view.webview.html = this.getHtmlForWebview(
        this._view.webview
      );

      const metadata = await readMetadata();
      this._view.webview.postMessage({
        command: "loadMetadata",
        data: metadata,
      });
    }
  }

  private extractImagePaths(documentText: string): string[] {
    const imagePaths = [];
    const match = documentText.match(IMAGES_REGEX);
    if (match && match[2]) {
      const paths = match[2].split(",").map((path) => path.trim());
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders) {
        const workspaceFolderUri = vscode.workspace.workspaceFolders[0].uri;
        return paths.map((path) =>
          vscode.Uri.joinPath(
            workspaceFolderUri,
            "images",
            `${path}.png`
          ).toString()
        );
      }
    }
    return imagePaths;
  }

  private getHtmlForWebview(
    webview: vscode.Webview
  ): string {
    const llmPanelScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "llm.panel.wvjs")
    );
    const stylesLLMUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "llm.css")
    );
    const stylesLLM2Uri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "llm2.css")
    );

    const contextScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "contextjs",
        "context.min.js"
      )
    );

    const eclipseGifUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "eclipse.svg")
    );

    const markdownScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "markdown.min.js")
    );

    const jqueryScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "jquery-3.7.1.min.js")
    );

    const stylesContextUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "contextjs",
        "skins",
        "hackerman.css"
      )
    );

    const uniqueString = new Date().getTime();
    // Append unique string to each image path

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

                    ${Globals.currentConversation
                      .map((message) => message.RenderHTML()
                      ) 
                      .join("")}
                    
                    <div class="new"></div>
                    
                    <div class="fadeable loadingAnimation" style="opacity: 0"><img src="${eclipseGifUri}" /></div>
                </div>


                <div id="chat-input">
                    <div id="file-input"></div>
                    <textarea id="query" placeholder=""></textarea>
                </div>

                </div>
                <link href="${stylesContextUri}" rel="stylesheet">
                <script src="${contextScriptUri}"></script>
                <script src="${markdownScriptUri}"></script>
                <script src="${jqueryScriptUri}"></script>
                <!---->
                <script src="${llmPanelScriptUri}"></script>
            </body>
            </html>
        `;
  }
}

export class QuestionAndAnswer {
  constructor(args: {
    question: string;
    answer?: {
        model?: string;
        content?: string;
    },
    context?: any}) {
    // this.index = args.index;
    this.question = args.question;
    this.answer = args.answer;
  }

  public index?: number;
  public question?: string;
  public answer?: {
    model?: string;
    content?: string;
  };

  public RenderHTML(): string {
    return `<div class="questionAndAnswer">
                <div class="question">${this.question}</div>
                    <div class="answer">
                      <div class="model">
                        ˜”*°•.˜”*°• <span class="model-name">${this.answer?.model || ""}</span> •°*”˜.•°*”˜
                      </div>
                      <pre class="raw"></pre>
                      <div class="marked">
                        ${this.answer?.content ? marked.parse(this.answer.content) : ``}
                      </div>
                    </div>
                </div>`;
  }

  public AddToPanel() {
    Globals.postWebViewMessage('addHTML', { html: this.RenderHTML(), selector: ".conversation .new" });
    
    Globals.postWebViewMessage('scrollToBottom');

    // Globals.llmConversation.push({ role: this.model, content: this.answer });
  }
}

function forceReflowWebview(webviewPanel) {
  const originalContent = webviewPanel.webview.html;
  webviewPanel.webview.html = "<html><body>Reloading...</body></html>";
  setTimeout(() => {
    webviewPanel.webview.html = originalContent;
  }, 100); // Delay can be adjusted
}
