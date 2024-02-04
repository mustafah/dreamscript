export async function llm(question: string, key = null) {
    try {
        const module = await import("@langchain/openai");
        const OpenAI = module.OpenAI;
        const llm = new OpenAI({
            openAIApiKey: key,
            temperature: 0,
            modelName: "gpt-4"
        });
        const llmResult = await llm.predict(question);
        // return he.decode(llmResult);
        return llmResult;
    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error to handle it in the caller function
    }
}