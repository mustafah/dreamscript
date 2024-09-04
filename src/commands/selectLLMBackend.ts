import * as vscode from 'vscode';
export const llmBackends = ['Ollama llama 3.1', 'Google Gemini', 'OpenAI', 'Ollama Mistral (Expiremental)'];

export async function selectLLMBackend() {
    // Get the current backend setting
    const currentBackend = vscode.workspace.getConfiguration().get<string>('dreamscript.llmBackend');

    // Reorder the options to put the current backend at the top
    const orderedBackends = llmBackends.filter(backend => backend !== currentBackend);
    if (currentBackend) {
        orderedBackends.unshift(currentBackend);
    }

    const selectedBackend = await vscode.window.showQuickPick(orderedBackends, {
        placeHolder: `Choose an LLM Backend (Currently set to \`${currentBackend}\`)`
    });

    if (selectedBackend && selectedBackend !== currentBackend) {
        await vscode.workspace.getConfiguration().update('dreamscript.llmBackend', selectedBackend, vscode.ConfigurationTarget.Global);
    }
}