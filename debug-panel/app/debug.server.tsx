import 'dotenv/config';
import { DocumentationStore } from "../../out/documentationStore.mjs";
import { GPTIntegration } from "../../out/gptIntegration.mjs";
import { DirectorySource } from "../../out/sources/directory.mjs";
import { PDFSource } from "../../out/sources/pdf.mjs";
import { WebsiteSource } from "../../out/sources/website.mjs";
let _docStore: DocumentationStore

async function getDocStore() {
    if (!_docStore) {
        _docStore = new DocumentationStore('.');
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


export async function runRetrieval(kValue: number, fetchK: number, searchType: string, query: string) {
    const retrieverParams = {
        k: kValue,
        searchType: searchType,
        fetchK: fetchK,
      };
      const docStore = await getDocStore();
      docStore.retrieverParams = retrieverParams;
      const retriever = docStore.getRetriever();
      const resultDocs = await retriever.getRelevantDocuments(
        query
      );
      const result = resultDocs.map((doc) => doc.pageContent).join("\n");
      return { result };
}

export async function reindex(sourceName: string, chunkSize: number, chunkOverlap: number, path: string) {
    const source = getSourceFromParams(sourceName, chunkSize, chunkOverlap);
    const docs = await source.load(path);
    const docStore = await getDocStore();
    await docStore.addDocuments(docs);
    await docStore.save();
    return { result: "Reindexing complete" };
}


export async function query(query: string, isGenerateCode: boolean) {
    const docStore = await getDocStore();
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