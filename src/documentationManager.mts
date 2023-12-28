import { BaseRetriever } from "langchain/schema/retriever";
import { DocumentationStore } from "./documentationStore.mjs";
import { DirectorySource } from "./sources/directory.mjs";

export class DocumentationManager {
  constructor(private docStore: DocumentationStore) {
    this.docStore = docStore;
  }

  async addSource(sourceType: string | undefined, path: string) {
    let source = new DirectorySource();
    switch (sourceType) {
      case "Directory":
        source = new DirectorySource();
        break;
      case "PDF":
        // Logic to index a PDF document
        break;
      case "Website":
        // Logic to index a website
        break;
    }
    console.log("Loading documents");
    const docs = await source.load(path);
    await this.docStore.addDocuments(docs);
    await this.saveDatabase();
  }

  getRetrieverForSource(): BaseRetriever {
    return this.docStore.getRetriever();
  }

  async deleteDocumentationSource(): Promise<void> {
    // Logic to delete a documentation source
  }

  async loadSavedDatabase(): Promise<void> {
    try {
      this.docStore.load();
    } catch (e) {
      console.log("No saved database found");
    }
  }

  async saveDatabase(): Promise<void> {
    this.docStore.save();
  }
}
