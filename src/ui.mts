// This module would contain logic to create and manage the UI components of the extension

import { createRequire } from "module";

import { DocumentationManager } from "./documentationManager.mjs";
import { DocumentationStore } from "./documentationStore.mjs";
import { GPTIntegration } from "./gptIntegration.mjs";
const require = createRequire(import.meta.url);
import vscode = require("vscode");

export default class ExtensionUI {
  storagePath: vscode.Uri;
  docManager: DocumentationManager;
  gptIntegration: GPTIntegration;

  constructor(storagePath: vscode.Uri) {
    this.storagePath = storagePath;
    this.docManager = new DocumentationManager(new DocumentationStore(storagePath.fsPath));
    this.gptIntegration = new GPTIntegration();
  }

  async postInit(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storagePath);
    } catch (e) {
      await vscode.workspace.fs.createDirectory(this.storagePath);
    }
    await this.docManager.loadSavedDatabase();
  }

  async addDocumentationSource(): Promise<void> {
    const sourceType = await vscode.window.showQuickPick([
      "Directory",
      "PDF",
      "Website",
    ]);
    const path = await vscode.window.showInputBox({
      prompt: "Enter the path to the documentation source",
      value: ''
    });
    if (!path) {
      return;
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Indexing documentation source",
        cancellable: false,
      },
      async (progress) => {
        await this.docManager.addSource(sourceType, path);
      }
    );
    await vscode.window.showInformationMessage(
        "Documentation source added successfully"
    );
  }

  async generateCode(): Promise<void> {
    const question = await vscode.window.showInputBox({
      prompt: "Enter a question to generate code for",
    });
    if (!question) {
      return;
    }
    const answer = await this.gptIntegration.generateCode(
      this.docManager.getRetrieverForSource(),
      question
    );
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(answer);
      return;
    }
    await editor.insertSnippet(new vscode.SnippetString(answer));

  }

  async answerQuestion(): Promise<void> {
    const question = await vscode.window.showInputBox({
      prompt: "Enter a question to answer",
    });
    if (!question) {
      return;
    }
    const answer = await this.gptIntegration.answerQuestion(
      this.docManager.getRetrieverForSource(),
      question
    );
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage(answer);
      return;
    }
    await editor.insertSnippet(new vscode.SnippetString(answer));

  }
}
