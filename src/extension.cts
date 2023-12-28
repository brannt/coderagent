import 'dotenv/config';
import * as vscode from "vscode";
// import { GPTIntegration } from "./gptIntegration.js";

export async function activate(context: vscode.ExtensionContext) {
   const setOpenAIKey = async () => {
    const key = await vscode.window.showInputBox({
      prompt: "Enter your OpenAI API key",
    });
    if (!key) {
      return;
    }
    await context.secrets.store("openai", key);
    process.env.OPENAI_API_KEY = key;
  }

  if (!process.env.OPENAI_API_KEY) {
    let openAIKey = await context.secrets.get("openai");
    if (!openAIKey) {
      await setOpenAIKey();
    } else {
      process.env.OPENAI_API_KEY = openAIKey;
    }
  }
  
  const ExtensionUI = (await import("./ui.mjs")).default;
  const extensionUI = new ExtensionUI(context.globalStorageUri);
  await extensionUI.postInit();
  const debugUI = await import("./debugUI.mjs");

  context.subscriptions.push(
    vscode.commands.registerCommand("coderagent.addDocumentationSource", () => {
      extensionUI.addDocumentationSource();
    }),
    // vscode.commands.registerCommand(
    //   "coderagent.deleteDocumentationSource",
    //   () => {
    //     extensionUI.deleteDocumentationSource();
    //   }
    // ),
    vscode.commands.registerCommand("coderagent.generateCode", () => {
      console.log("generateCode");
      extensionUI.generateCode();
    }),
    vscode.commands.registerCommand("coderagent.answerQuestion", () => {
      extensionUI.answerQuestion();
    }),
    vscode.commands.registerCommand("coderagent.setOpenAIKey", setOpenAIKey),
    vscode.commands.registerCommand("coderagent.DEBUG", () => {
      debugUI.showDebugUI(context);
    })
    // vscode.commands.registerCommand("coderagent.manageDatabase", () => {
    //   extensionUI.manageDatabase();
    // })
  );
}

export function deactivate() {}
