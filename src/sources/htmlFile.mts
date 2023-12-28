import { Document } from "langchain/document";
import { HtmlToTextTransformer } from "langchain/document_transformers/html_to_text";
import { RecursiveCharacterTextSplitter, TextSplitterParams } from "langchain/text_splitter";

export class HtmlFileSource {
  splitterLanguage: string = "html";
  splitterParams: TextSplitterParams = {
    chunkSize: 1000,
    chunkOverlap: 100,
    keepSeparator: true,
  };
  async load(fileContent: string): Promise<Document[]> {
    const docs = [new Document({pageContent: fileContent})]
    const splitter = RecursiveCharacterTextSplitter.fromLanguage("html", this.splitterParams);
    const transformer = new HtmlToTextTransformer();

    const sequence = splitter.pipe(transformer);
    console.log("%d documents loaded, splitting and transforming", docs.length)
    const newDocuments = await sequence.invoke(docs);
    return newDocuments.filter((doc) => doc.pageContent !== undefined);
  }
}
