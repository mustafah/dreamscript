import * as vscode from 'vscode';
import { branch } from './commands/branch.command';
import { pasteImage } from './commands/paste-images.command';
import { ImagesPanelViewProvider } from './commands/images.panel';
import { Globals } from './globals';
import { translateCommand } from './commands/translate.command';
import { emojify, emojifyCommand } from './commands/emojify.command';
import { promptify } from './commands/promptify.command';
import { Keys } from './commands/keys';
import { selectLLMBackend } from './commands/selectLLMBackend';
import { compileCommand } from './commands/compile.command';
import { formatCommand } from './commands/format.command';
import { exportCommand } from './commands/export.command';
import { pasteParameters } from './commands/paste-parameters.command';
import { colorize } from './commands/colorize.command';
import { clearEmojis } from './commands/clearEmojis.command';
import { clearTranslations } from './commands/clearTranslations.command';
import { customizedPromptify } from './commands/customizedPromptify.command';
import { createPrompt } from './commands/createPrompt.command';
import { pastePrompt } from './commands/paste-prompt.command';
import { merge } from './commands/merge.command';
import { LLMPanelViewProvider } from './commands/llm.panel';
import axios from 'axios';

async function test2() {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'llama3.1',
            prompt: 'give me steps I need to learn c# ?',
            stream: true
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });

        response.data.on('data', (chunk) => {
            const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                const parsed = JSON.parse(line);
                if (parsed.response) {
                    console.log(parsed);
                    // res.write(`data: ${JSON.stringify({ token: parsed.response })}\n\n`);
                }
            }
        });

        response.data.on('end', () => {
            console.log('end');
            // res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            // res.end();
        });

    } catch (error) {
        console.error('Error calling OLLAMA API:', error);
        // res.write(`data: ${JSON.stringify({ error: 'Error generating response' })}\n\n`);
        // res.end();
    }
}
async function test() {
    const api = axios.create({
        baseURL: 'http://localhost:11434/api',
      });
      
      const data = {
        model: 'llama3.1',
        prompt: 'give me steps I need to learn c# ?',
        stream: true,
      };
      
    //   const response = await api.post('generate', JSON.stringify(data), {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       responseType: 'stream'
    //     },
    //   });

    //   const stream = response.data;
    // // //
    api.post('generate', JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          responseType: 'stream'
        },
      }).then(response => {
        const stream = response.data;
        
        stream.on("data", chunk => {
        //   APIdata.push(chunk)
            console.log(chunk);
        });
        
        stream.on("end", () => {
            console.log("end of stream");
        });
    });
    //   stream.then(data => { 
    //     // data = data.toString();
    //     console.log(data);
    //   });
    //   .then(response => {
    //     console.log(response.data);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //   });

    //   const response = await axios.get(`https://stream.example.com`, {
    //     headers: {Authorization: `Bearer ${token}`}, 
    //     responseType: 'stream'
    //   });
      
    //   const stream = response.data
    //   stream.on('data', data => { 
    //     data = data.toString()
    //     console.log(data) 
    //   })
}
export async function activate(context: vscode.ExtensionContext) {

    setTimeout(() => {
        Globals.llmPanelProvider.postMessage({ command: 'addLLMResponseChunk', data: "hello" });
    }, 2000);

    // <ImagesPanel>
    Globals.extensionContext = context;
    const provider = Globals.imagesPanelProvider = new ImagesPanelViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ImagesPanelViewProvider.viewType, provider));
    // </ImagesPanel>

    // <LLMPanel>
    Globals.extensionContext = context;
    const provider2 = Globals.llmPanelProvider = new LLMPanelViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(LLMPanelViewProvider.viewType, provider2));
    // </LLMPanel>
    
    // <Branch>
    const branchDisposable = vscode.commands.registerCommand('dreamscript.branch', async () => {
        await branch();
    });
    context.subscriptions.push(branchDisposable);
    // </Branch>

    // <PasteImage>
    const pasteImageDisposable = vscode.commands.registerCommand('dreamscript.pasteImage', async () => {
        await pasteImage();
    });
    context.subscriptions.push(pasteImageDisposable);
    // </PasteImage>

    // <PasteParameters>
    const pasteParametersDisposable = vscode.commands.registerCommand('dreamscript.pasteParameters', async () => {
        await pasteParameters();
    });
    context.subscriptions.push(pasteParametersDisposable);
    // </PasteParameters>

    // <pastePrompt>
    const pastePromptDisposable = vscode.commands.registerCommand('dreamscript.pastePrompt', async () => {
        await pastePrompt();
    });
    context.subscriptions.push(pastePromptDisposable);
    // </pastePrompt>


    // <Translate>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.translate', async () => {
        await translateCommand();
    }));
    // </Translate>

    // <Emojify>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.emojify', async () => {
        // await emojify();
        await emojifyCommand();
    }));
    // </Emojify>

    // <Promptify>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.promptify', async () => {
        await promptify();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.customizedPromptify', async () => {
        await customizedPromptify();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.createPromptify', async () => {
        await createPrompt();
    }));
    // </Promptify>

    // <Colorize>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.colorize', async () => {
        await colorize();
    }));
    // </Colorize>

    // <ClearKeys>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.clearKeys', async () => {
        await Keys.removeKey('OPENAI_API_KEY');
    }));
    // </ClearKeys>

    // <LLM Backend>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.selectLLMBackend', async () => {
        selectLLMBackend();
    }));
    // </LLM Backend>

    // <Compile>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.compile', async () => {
        compileCommand();
    }));
    // </Compile>

    // <Format>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.format', async () => {
        formatCommand();
    }));
    // </Format>

    // <Export>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.export', async () => {
        exportCommand(false);
    }));
    // </Export>

    // <Export>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.exportWithPassword', async () => {
        exportCommand(true);
    }));
    // </Export>

    // <ClearEmojis>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.clearEmojis', async () => {
        clearEmojis();
    }));
    // </ClearEmojis>

    // <ClearTranslations>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.clearTranslations', async () => {
        clearTranslations();
    }));
    // </ClearTranslations>

    // <Merge>
    context.subscriptions.push(vscode.commands.registerCommand('dreamscript.merge', async () => {
        merge();
    }));
    // </Merge>
}
