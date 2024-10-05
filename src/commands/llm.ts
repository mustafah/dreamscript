import * as vscode from "vscode";
import { Keys } from "./keys";
import axios from "axios";
import { Configs } from "./configs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Globals } from "../globals";

declare let document;
export async function llm(question: string) {
  // // //
  // // //
  console.log("Dreamscript.Prompt ?", question);
  const backendChoice = await Configs.getConfig("llmBackend");

  if (backendChoice.toLowerCase().includes("llama")) {
    ollama(question);
  } else if (backendChoice.toLowerCase().includes("mistral")) {
    // Use Ollama Mistral
    const data = JSON.stringify({
      model: "mistral",
      prompt: question,
      options: { temperature: 0 },
      stream: false,
    });
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:11434/api/generate",
      headers: { "Content-Type": "application/json" },
      stream: false,
      data: data,
    };

    try {
      const response = await axios.request(config);
      return response.data.response;
    } catch (error) {
      console.error("Error with Ollama Mistral:", error);
      throw error;
    }
  } else if (backendChoice.toLowerCase().includes("gemini")) {
    try {
      const googleGeminiApiKey = await Keys.getSecret(
        "GOOGLE_GEMINI_API_KEY",
        "Google Gemini API key",
        "Get your key from the Google Cloud Console"
      );
      if (!googleGeminiApiKey?.trim())
        throw "No Google Gemini API key is provided";

      // Access your API key as an environment variable (see "Set up your API key" above)
      const genAI = new GoogleGenerativeAI(googleGeminiApiKey);
      // For text-only input, use the gemini-pro model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const stream = true;
      if (stream) {
        const result = await model.generateContentStream(question);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          console.log(chunkText);
          document.getElementsByClassName("streamed")[0].textContent += chunk;
          Globals.currentStreamReply += chunk;
        }
      } else {
        const result = await model.generateContent(question);
        const response = await result.response;
        const text = response.text();
        return text;
      }
    } catch (error) {
      console.error("Error with Google Gemini:", error);
      throw error;
    }
  } else {
    // Use OpenAI
    const openAiKey = await Keys.getSecret(
      "OPENAI_API_KEY",
      "OpenAI API token",
      "Get your key from https://platform.openai.com/api-keys"
    );
    if (!openAiKey?.trim()) throw "No OpenAI API token is provided";

    try {
      const module = await import("@langchain/openai");
      const OpenAI = module.OpenAI;
      const llm = new OpenAI({
        openAIApiKey: openAiKey,
        temperature: 0,
        modelName: "gpt-4",
      });
      return await llm.predict(question);
    } catch (error) {
      console.error("Error with OpenAI:", error);
      throw error;
    }
  }
}

async function ollama(question) {
  try {
    Globals.llmPanelProvider.postMessage({
      command: "startLLMResponseChunk",
      data: {},
    });

    // Globals.llmConversation.push({
    //   role: "dreamscript",
    //   content: question,
    // });
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1",
        prompt: question,
        stream: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );
    response.data.on("data", (chunk) => {
      const lines = chunk
        .toString()
        .split("\n")
        .filter((line) => line.trim() !== "");
      for (const line of lines) {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          const res = parsed.response;
          Globals.llmPanelProvider.postMessage({
            command: "addLLMResponseChunk",
            data: { content: res, model: parsed.model },
          });
          // document.getElementsByClassName("streamed")[0].textContent += res;
          // res.write(`data: ${JSON.stringify({ token: parsed.response })}\n\n`);
        }
        if (parsed.done) {
          Globals.llmPanelProvider.postMessage({
            command: "endLLMResponseChunk",
            data: null,
          });
        }
      }
    });

    response.data.on("end", () => {
      console.log("end");
      // res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      // res.end();
    });
  } catch (error) {
    console.error("Error calling OLLAMA API:", error);
    // res.write(`data: ${JSON.stringify({ error: 'Error generating response' })}\n\n`);
    // res.end();
  }
}
