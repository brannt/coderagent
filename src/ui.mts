// This module would contain logic to create and manage the UI components of the extension


import { DocumentationManager } from "./documentationManager.mjs";
import { GPTIntegration } from "./gptIntegration.mjs";
import vscode from "./requireVscode.mjs";

export default class ExtensionUI {
  storagePath: vscode.Uri;
  docManager: DocumentationManager;
  gptIntegration: GPTIntegration;

  constructor(storagePath: vscode.Uri, memento: vscode.Memento) {
    this.storagePath = storagePath;
    this.docManager = new DocumentationManager(storagePath.fsPath, memento);
    this.gptIntegration = new GPTIntegration();
  }

  async postInit(): Promise<void> {
    try {
      await vscode.workspace.fs.stat(this.storagePath);
    } catch (e) {
      await vscode.workspace.fs.createDirectory(this.storagePath);
    }
    await this.docManager.loadSavedSources();
  }

  async addDocumentationSource(): Promise<void> {
    const sourceType = await vscode.window.showQuickPick([
      "Directory",
      "PDF",
      "Website",
    ]);
    const sourcePath = await vscode.window.showInputBox({
      prompt: "Enter the path to the documentation source",
      value: ''
    });
    if (!sourcePath) {
      return;
    }
    const sourceName = await vscode.window.showInputBox({
      prompt: "Enter the documentation source name",
      value: ''
    });
    if (!sourceName) {
      return;
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Indexing documentation source ${sourceName}`,
        cancellable: false,
      },
      async (progress) => {
        await this.docManager.addSource(sourceName, sourceType, sourcePath);
      }
    );
    await vscode.window.showInformationMessage(
        `Documentation source ${sourceName} added successfully`
    );
  }

  async deleteDocumentationSource(): Promise<void> {
    const sourceName = await vscode.window.showQuickPick(
      this.docManager.listSources()
    );
    if (!sourceName) {
      return;
    }
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Deleting documentation source ${sourceName}`,
        cancellable: false,
      },
      async (progress) => {
        await this.docManager.deleteDocumentationSource(sourceName);
      }
    );
    await vscode.window.showInformationMessage(
      `Documentation source ${sourceName} deleted successfully`
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
