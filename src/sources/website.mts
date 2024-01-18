import { compile } from "html-to-text";
import { Document } from "langchain/document";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter, TextSplitterParams } from "langchain/text_splitter";

export class WebsiteSource {
  splitterParams: TextSplitterParams  = {
    chunkSize: 1000,
    chunkOverlap: 100,
    keepSeparator: true,
  };
  async load(url: string): Promise<Document[]> {
    const compiledConvert = compile({ wordwrap: false });
    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 3,
    });
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter(this.splitterParams);
    const newDocuments = await splitter.splitDocuments(docs);
    return newDocuments.filter((doc) => doc.pageContent !== undefined);
  }
}
