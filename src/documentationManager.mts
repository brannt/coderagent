import { EmbeddingsInterface } from "langchain/embeddings/base";
import { BaseRetriever } from "langchain/schema/retriever";
import { DocumentationStore } from "./documentationStore.mjs";
import vscode from "./requireVscode.mjs";
import { DirectorySource } from "./sources/directory.mjs";
import { PDFSource } from "./sources/pdf.mjs";
import { WebsiteSource } from "./sources/website.mjs";

export class DocumentationManager {
  docStores: Record<string, DocumentationStore>;
  storagePath: string;
  state: vscode.Memento;

  constructor(
    storagePath: string,
    state: vscode.Memento,
  ) {
    this.docStores = {};
    this.storagePath = storagePath;
    this.state = state;
  }

  async addSource(
    sourceName: string,
    sourceType: string | undefined,
    path: string,
    embeddings?: EmbeddingsInterface
  ): Promise<void> {
    let source: DirectorySource | PDFSource | WebsiteSource;
    switch (sourceType) {
      case "Directory":
        source = new DirectorySource();
        break;
      case "PDF":
        source = new PDFSource();
        break;
      case "Website":
        source = new WebsiteSource();
        break;
      default:
        throw new Error(`Unknown source type ${sourceType}`);
    }
    console.log("Loading documents");
    const docs = await source.load(path);
    await vscode.workspace.fs.createDirectory(
      vscode.Uri.parse(this.storagePath + "/" + sourceName)
    );
    const docStore = new DocumentationStore(
      this.storagePath + "/" + sourceName,
      embeddings
    );
    await docStore.addDocuments(docs);
    await docStore.save();
    this.docStores[sourceName] = docStore;
    await this.saveSources(false);
  }

  getRetrieverForSource(sourceName: string): BaseRetriever {
    const store = this.docStores[sourceName];
    if (!store) {
      throw new Error(`Documentation source ${sourceName} not found.`);
    }
    return store.getRetriever();
  }

  async deleteDocumentationSource(sourceName: string): Promise<void> {
    const store = this.docStores[sourceName];
    await vscode.workspace.fs.delete(
      vscode.Uri.parse(store.getStoragePath()),
      { recursive: true }
    );
    delete this.docStores[sourceName];
  }

  async loadSavedSources(): Promise<void> {
    const savedDocStores = this.state.get<[string, string][]>(
      "docStores"
    );
    if (savedDocStores) {
      this.docStores = Object.fromEntries(
        savedDocStores.map(([key, value]: [string, string]) => [
          key,
          new DocumentationStore(value),
        ])
      )
    }
    for (const docStore of Object.values(this.docStores)) {
      try {
        await docStore.load();
      } catch (e) {
        console.log("No saved database found");
      }
    }
  }

  async saveSources(withFiles: boolean): Promise<void> {
    if (withFiles) {
      for (const docStore of Object.values(this.docStores)) {
        await docStore.save();
      }
    }
    await this.state.update("docStores", Object.entries(this.docStores).map(([key, value]) => [key, value.getStoragePath()]));
  }

  async listSources(): Promise<string[]> {
    return Object.keys(this.docStores);
  }
}
