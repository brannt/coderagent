import { Document } from "langchain/document";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter, TextSplitterParams } from "langchain/text_splitter";

export class PDFSource {
  splitterParams: TextSplitterParams = {
    chunkSize: 1000,
    chunkOverlap: 100,
    keepSeparator: true,
  };

  async load(filePath: string): Promise<Document[]> {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter(this.splitterParams);
    const newDocuments = await splitter.splitDocuments(docs);
    return newDocuments.filter((doc) => doc.pageContent !== undefined);
  }
}
