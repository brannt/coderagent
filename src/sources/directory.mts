import { Document } from "langchain/document";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { HtmlToTextTransformer } from "langchain/document_transformers/html_to_text";
import { RecursiveCharacterTextSplitter, SupportedTextSplitterLanguage, TextSplitterParams } from "langchain/text_splitter";

export class DirectorySource {
  splitterLanguage: SupportedTextSplitterLanguage = "html";
  splitterParams: TextSplitterParams = {
    chunkSize: 1000,
    chunkOverlap: 100,
    keepSeparator: true,
  };
  async load(filePath: string): Promise<Document[]> {
    const loader = new DirectoryLoader(filePath, {
      ".html": (path) => new TextLoader(path),
    });
    const docs = await loader.load();
    const splitter = RecursiveCharacterTextSplitter.fromLanguage(this.splitterLanguage, this.splitterParams);
    const transformer = new HtmlToTextTransformer({selectors: [ { selector: 'a', options: { ignoreHref: true } } ]});

    const sequence = transformer.pipe(splitter);
    console.log("%d documents loaded, splitting and transforming", docs.length)
    const newDocuments = await sequence.invoke(docs);
    return newDocuments.filter((doc) => doc.pageContent !== undefined);
  }
}
