import { ImagesPanelViewProvider } from "./commands/images.panel";
import * as vscode from "vscode";
import { LLMPanelViewProvider } from "./commands/llm.panel";

export class Globals {
  public static imagesPanelProvider: ImagesPanelViewProvider | null = null;
  public static llmPanelProvider: LLMPanelViewProvider | null = null;
  public static extensionContext: vscode.ExtensionContext | null = null;
  public static llmConversation = [
    {
      role: "dreamscript",
      content: "Can you give me more variations on this ?",
    },
    {
      role: "llm",
      content: "Here is 1, 2 and three ..",
    },
    {
      role: "dreamscript",
      content: "Can you give me more variations on this 2 ?",
    },
    {
      role: "dreamscript",
      content: "Can you give me more variations on this 3 ?",
    },
    {
      role: "dreamscript",
      content: "Can you give me more variations on this 4 ?",
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
