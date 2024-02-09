import * as vscode from 'vscode';
import { Keys } from './keys';
import axios from 'axios';
import { Configs } from './configs';

export async function llm(question: string) {
    console.log('Dreamscript.Prompt ?', question);
    const backendChoice = await Configs.getConfig('llmBackend');

    if (backendChoice.toLowerCase().includes('mistral')) {
        // Use Ollama Mistral
        const data = JSON.stringify({ "model": "mistral", "prompt": question, "options": {"temperature": 0}, "stream": false });
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:11434/api/generate',
            headers: { 'Content-Type': 'application/json' },
            stream: false,
            data: data
        };

        try {
            const response = await axios.request(config);
            return response.data.response;
        } catch (error) {
            console.error("Error with Ollama Mistral:", error);
            throw error;
        }
    } else {
        // Use OpenAI
        const openAiKey = await Keys.getSecret('OPENAI_API_KEY', 'OpenAI API token', 'Get your key from https://platform.openai.com/api-keys');
        if (!openAiKey?.trim()) throw "No OpenAI API token is provided";

        try {
            const module = await import('@langchain/openai');
            const OpenAI = module.OpenAI;
            const llm = new OpenAI({ openAIApiKey: openAiKey, temperature: 0, modelName: 'gpt-4' });
            return await llm.predict(question);
        } catch (error) {
            console.error("Error with OpenAI:", error);
            throw error;
        }
    }
}
