// import { OpenAI } from "langchain/llms/openai";
const OPENAI_KEY = "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";

const question = `

  Please extract the sentences inside Prompt details section of the below TEXT, that contain the main idea of the scene, put each one of them in individual line, it shouldn't contain the artists and the sentences expressing styles
  ''' TEXT
  Prompt details

  inspired from the palestine flag on city of Jerusalem, Picture a vibrant joyous Palestinian arab male kid with wings of very beautiful angels ,holding flowers like chamomile and palestine flag very apparent on a back flower baseket behind his back, looking at a distant horrible weapon rockets falling on ALAqsa mosque , Their gazes are fixed on a vision of paradise,serene lushful green landscape as the sun sets, casting a golden light over a verdant land under a calm baby blue sky, ,soft tones, colorful machine, colorful colors, high quality, 8K Ultra HD, high detailed, masterpiece, luminism, Isometric, awesome full color, luminism, three dimensional effect, enhanced beauty, by yukisakura, Albert Anker, Kyoto Animation, Greg Rutkowski, Artgerm, Alphonse Beeple, WLOP

  Input Resolution
  768 x 512px
  Created
  21/11/23 at 4:19 PM
  Pipeline
  Alchemy
  V2
  
  Seed
  282208512
  Preset
  Sketch Color
  Prompt Magic
  -
  Init Strength
  No init image
  High Contrast
  -
  AlbedoBase XL
  Finetuned Model

  AlbedoBase XL

`;

export async function llm2(question: string) {
  try {
    import("@langchain/openai").then(async module => {
        const OpenAI = module.OpenAI;
        // https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
        const llm = new OpenAI({
            openAIApiKey: OPENAI_KEY,
            temperature: 0,
            modelName: "gpt-4"
        });
    
        const llmResult = await llm.predict(question);
    
        return llmResult;
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function llm(question: string): Promise<any> {
    try {
        const module = await import("@langchain/openai");
        const OpenAI = module.OpenAI;
        const llm = new OpenAI({
            openAIApiKey: OPENAI_KEY,
            temperature: 0.7,
            // modelName: "gpt-4",
            modelName: "gpt-4-1106-preview"
        });
        const llmResult = await llm.predict(question);
        return llmResult;
    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error to handle it in the caller function
    }
}