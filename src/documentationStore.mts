import { Document } from "langchain/document";
import { EmbeddingsInterface } from "langchain/embeddings/base";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SaveableVectorStore, VectorStoreRetriever } from "langchain/vectorstores/base";
import { FaissStore } from "langchain/vectorstores/faiss";

export class DocumentationStore {
  private vecStore: SaveableVectorStore | null = null;
  private vecStoreClass: typeof SaveableVectorStore = FaissStore;
  private embeddings: EmbeddingsInterface;
  retrieverParams: Record<string, any> = {};
  constructor(private storagePath: string, embeddings?: EmbeddingsInterface) {
    this.storagePath = storagePath;
    this.embeddings = embeddings ?? new OpenAIEmbeddings();
  }

  async addDocuments(docs: Document[]): Promise<void> {
    console.log("Adding documents to the database: %s", JSON.stringify(docs[0]));
    const vecStore = await this.vecStoreClass.fromDocuments(
      docs,
      this.embeddings,
      {}
    );
    this.vecStore = vecStore as SaveableVectorStore;
  }

  async findSimilarDocuments(query: string, k?: number): Promise<Document<Record<string, any>>[]> {
    if (!this.vecStore) {
      throw new Error("Vector store is not initialized. Please call addDocuments first.");
    }
    return await this.vecStore.similaritySearch(query, k);
  }

  getRetriever(): VectorStoreRetriever {
    if (!this.vecStore) {
      throw new Error("Vector store is not initialized. Please call addDocuments first.");
    }
    return this.vecStore.asRetriever(this.retrieverParams.k);
  }

  async save(): Promise<void> {
    if (!this.vecStore) {
      throw new Error("Vector store is not initialized. Please call addDocuments first.");
    }
    await this.vecStore.save(this.storagePath);
  }

  async load(): Promise<void> {
    this.vecStore = await this.vecStoreClass.load(this.storagePath, this.embeddings);
  }

  getStoragePath(): string {
    return this.storagePath;
  }
}
