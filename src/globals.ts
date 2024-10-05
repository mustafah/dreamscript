import { ImagesPanelViewProvider } from "./commands/images.panel";
import * as vscode from "vscode";
import { LLMPanelViewProvider } from "./commands/llm.panel";

export class Globals {
  public static imagesPanelProvider: ImagesPanelViewProvider | null = null;
  public static llmPanelProvider: LLMPanelViewProvider | null = null;
  public static extensionContext: vscode.ExtensionContext | null = null;

  public static postWebViewMessage(command, args = {}) {
    Globals.llmPanelProvider.postMessage({command: command, data: args});
  }

  public static currentStreamReply = "";

  public static SampleQuestions = [
    `Let's spark your imagination together! 🧠✨💡 How can I fuel your creative fire with some inspiring prompts?`,
    `Ready to dive into a world of creativity? 🌎🎨💭 Ask away! How can I help you brainstorm your next big idea?`,
    `Need a creative nudge?  nudge nudge wink 😉 Let's collaborate on some prompts that will ignite your inspiration!`
  ];

  public static llmConversation = [
    {
      question: this.SampleQuestions[Math.floor(Math.random() * this.SampleQuestions.length)],
      // answer: {
      //   model: "llama",
      //   content: "No, I can't help yourself ...",
      // }
    }
  ];

  public static llmConversationAttachments = [
    {
        content: 
`Cast a glance at what has passed,
How many halves lived,
How many halves awted you but never came`
    },
    {
        content: 
`Cast a glance at what has passed 2`
    }
  ];
}
