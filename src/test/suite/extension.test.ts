import * as assert from "assert";
import 'dotenv/config';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

class MockMemento implements vscode.Memento {
  private storage: { [key: string]: any } = {};

  get<T>(key: string): T | undefined {
    return this.storage[key];
  }

  update(key: string, value: any): Thenable<void> {
    this.storage[key] = value;
    return Promise.resolve();
  }

  keys(): readonly string[] {
    return Object.keys(this.storage);
  }
}
suite("Extension Test Suite", async () => {
  const { DocumentationManager } = await import(
    "../../documentationManager.mjs"
  );
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  // Test index and retrieval with mocked vector database
  // First, we need to create the document store with MemoryVectorStore
  // and mocked embedding model
  // Then, we need to create a document manager with the document store
  // Then, we need to add a documentation source to the document manager
  // Then, we need to test finding similar documents
  test("Index and retrieval", async () => {
    const docManager = new DocumentationManager("file:///tmp/", new MockMemento());
    await docManager.addSource(
      "Test",
      "Directory",
      'src/test/suite/testData'
    );
    const retriever = docManager.getRetrieverForSource();
    const similarDocs = await retriever.getRelevantDocuments("Hello world");
    assert.strictEqual(similarDocs.length, 1);
  });
});
