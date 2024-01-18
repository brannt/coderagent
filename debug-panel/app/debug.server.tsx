import * as dotenv from "dotenv";
import * as fs from "fs";
import { DocumentationStore } from "../../out/documentationStore.mjs";
import { getEmbeddings } from "../../out/embeddings.mjs";
import { GPTIntegration } from "../../out/gptIntegration.mjs";
import { DirectorySource } from "../../out/sources/directory.mjs";
import { PDFSource } from "../../out/sources/pdf.mjs";
import { WebsiteSource } from "../../out/sources/website.mjs";

export function findEnvFileRecursive(path: string): string {
    const envPath = `${path}/.env`;
    console.log(`Checking for env file at ${envPath}`);
    if (fs.existsSync(envPath)) {
        return envPath;
    }
    const parentPath = path.split('/').slice(0, -1).join('/');
    if (parentPath === '') {
        throw new Error("No .env file found");
    }
    return findEnvFileRecursive(parentPath);

}

dotenv.config({ path: findEnvFileRecursive(process.cwd()) });
let _docStore: DocumentationStore

async function getDocStore(embedding?: string) {
    const path = embedding ? embedding : 'default'
    const embeddingClass = getEmbeddings(embedding);
    if (!_docStore || _docStore.storagePath !== path) {
        _docStore = new DocumentationStore(path, embeddingClass);
        try {
            await _docStore.load();
        } catch (e) {
            console.log("No documentation store found, creating new one");
        }
    }
    return _docStore;
}


export async function runSplitter(sourceName: string, chunkSize: number, chunkOverlap: number, path: string) {
    const source = getSourceFromParams(sourceName, chunkSize, chunkOverlap);
    const docs = await source.load(path);
    const result = docs.map((doc) => doc.pageContent).join("\n\n---\n\n");
    return { result };
}


export async function runRetrieval(kValue: number, fetchK: number, searchType: string, query: string, embedding?: string) {
    const retrieverParams = {
        k: kValue,
        searchType: searchType,
        fetchK: fetchK,
      };
      const docStore = await getDocStore(embedding);
      docStore.retrieverParams = retrieverParams;
      const retriever = docStore.getRetriever();
      const resultDocs = await retriever.getRelevantDocuments(
        query
      );
      const result = resultDocs.map((doc) => doc.pageContent).join("\n");
      return { result };
}

export async function reindex(sourceName: string, chunkSize: number, chunkOverlap: number, path: string, embedding: string) {
    const source = getSourceFromParams(sourceName, chunkSize, chunkOverlap);
    const docs = await source.load(path);
    const docStore = await getDocStore(embedding);
    await docStore.addDocuments(docs);
    await docStore.save();
    return { result: "Reindexing complete" };
}


export async function query(query: string, isGenerateCode: boolean, embedding?: string) {
    const docStore = await getDocStore(embedding);
    const retriever = docStore.getRetriever();
    const gpt = new GPTIntegration();
    const result = isGenerateCode ?
        await gpt.generateCode(retriever, query):
        await gpt.answerQuestion(retriever, query);

    return { result };
}

function getSourceFromParams(sourceName: string, chunkSize: number, chunkOverlap: number) {
    let source;
    switch (sourceName) {
        case 'directory':
            source = new DirectorySource();
            break;
        case 'pdf':
            source = new PDFSource();
            break;
        case 'website':
            source = new WebsiteSource();
            break;
        default:
            throw new Error(`Unknown source: ${sourceName}`);
    }
    source.splitterParams.chunkSize = chunkSize;
    source.splitterParams.chunkOverlap = chunkOverlap;
    return source;
}