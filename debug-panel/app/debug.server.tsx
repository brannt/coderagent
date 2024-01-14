import 'dotenv/config';
import { DocumentationStore } from "../../out/documentationStore.mjs";
import { GPTIntegration } from "../../out/gptIntegration.mjs";
import { DirectorySource } from "../../out/sources/directory.mjs";
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
export async function runSplitter(chunkSize: number, chunkOverlap: number, directory: string) {
    const source = new DirectorySource();
    source.splitterParams.chunkSize = chunkSize;
    source.splitterParams.chunkOverlap = chunkOverlap;
    const docs = await source.load(directory);
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

export async function reindex(chunkSize: number, chunkOverlap: number, directory: string) {
    const source = new DirectorySource();
    source.splitterParams.chunkSize = chunkSize;
    source.splitterParams.chunkOverlap = chunkOverlap;
    const docs = await source.load(directory);
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