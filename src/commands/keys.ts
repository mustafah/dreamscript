import * as vscode from 'vscode';

export async function getKey(): Promise<string | undefined> {
    let openAiKey = await vscode.secrets.get('OPENAI_KEY');

    if (!openAiKey) {
        const inputKey = await vscode.window.showInputBox({
            prompt: "Enter your OpenAI API Key",
            ignoreFocusOut: true,
            password: true
        });

        if (inputKey) {
            await vscode.secrets.store('OPENAI_KEY', inputKey);
            openAiKey = inputKey;
        } else {
            vscode.window.showErrorMessage("OpenAI API Key is required.");
        }
    }

    return openAiKey;
}
